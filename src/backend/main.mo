import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Text "mo:core/Text";
import Iter "mo:core/Iter";
import List "mo:core/List";
import Nat "mo:core/Nat";
import MixinStorage "blob-storage/Mixin";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";
import Time "mo:core/Time";
import Int "mo:core/Int";
import Order "mo:core/Order";
import Storage "blob-storage/Storage";
import Array "mo:core/Array";

actor {
  type ArticleInternal = {
    title : Text;
    subtitle : ?Text;
    body : Text;
    category : Text;
    slug : Text;
    coverImage : Storage.ExternalBlob;
    publishDate : Time.Time;
    published : Bool;
  };

  module ArticleInternal {
    public func compareByCategory(article1 : ArticleInternal, article2 : ArticleInternal) : Order.Order {
      Text.compare(article1.category, article2.category);
    };

    public func compareByPublishDate(article1 : ArticleInternal, article2 : ArticleInternal) : Order.Order {
      Int.compare(article1.publishDate, article2.publishDate);
    };

    public func compareByTitle(article1 : ArticleInternal, article2 : ArticleInternal) : Order.Order {
      Text.compare(article1.title, article2.title);
    };
  };

  let articles = Map.empty<Text, ArticleInternal>();
  let articlesByCategory = Map.empty<Text, List.List<ArticleInternal>>();
  let categories = List.empty<Text>();
  let pendingArticles = List.empty<ArticleInternal>();
  let trendingArticles = List.empty<ArticleInternal>();

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  include MixinStorage();

  public type Article = {
    title : Text;
    subtitle : ?Text;
    body : Text;
    category : Text;
    slug : Text;
    coverImage : Storage.ExternalBlob;
    publishDate : Time.Time;
    published : Bool;
  };

  public type ArticleInput = {
    title : Text;
    subtitle : ?Text;
    body : Text;
    category : Text;
    slug : Text;
    coverImage : Storage.ExternalBlob;
    publishDate : Time.Time;
  };

  public type ArticleSummary = {
    title : Text;
    subtitle : ?Text;
    category : Text;
    slug : Text;
    coverImage : Storage.ExternalBlob;
    publishDate : Time.Time;
  };

  public type UserProfile = {
    name : Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  // Helper functions 
  func toSummary(article : ArticleInternal) : ArticleSummary {
    {
      title = article.title;
      subtitle = article.subtitle;
      category = article.category;
      slug = article.slug;
      coverImage = article.coverImage;
      publishDate = article.publishDate;
    };
  };

  // removes article in all lists by category and status
  func removeArticleFromAllLists(slug : Text) {
    func filterBySlug(article : ArticleInternal) : Bool {
      article.slug != slug;
    };

    articlesByCategory.keys().forEach(
      func(category) {
        switch (articlesByCategory.get(category)) {
          case (?list) {
            let filteredList = list.filter(filterBySlug);
            articlesByCategory.add(category, filteredList);
          };
          case (null) {};
        };
      }
    );

    let filteredPending = pendingArticles.filter(filterBySlug);
    let filteredTrending = trendingArticles.filter(filterBySlug);

    // Update the original lists with filtered results
    pendingArticles.clear();
    trendingArticles.clear();
    filteredPending.forEach(func(article) { pendingArticles.add(article) });
    filteredTrending.forEach(func(article) { trendingArticles.add(article) });
  };

  // Create a new article
  public shared ({ caller }) func createArticle(input : ArticleInput) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can create articles");
    };

    let article = {
      input with
      published = false;
    };
    articles.add(input.slug, article);

    if (not categories.contains(article.category)) {
      categories.add(article.category);
    };

    switch (articlesByCategory.get(input.category)) {
      case (null) {
        let newList = List.empty<ArticleInternal>();
        newList.add(article);
        articlesByCategory.add(article.category, newList);
      };
      case (?existingList) {
        existingList.add(article);
      };
    };
    pendingArticles.add(article);
  };

  // Update an existing article
  public shared ({ caller }) func updateArticle(slug : Text, input : ArticleInput, published : Bool) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update articles");
    };
    if (not articles.containsKey(slug)) {
      Runtime.trap("Article does not exist");
    };

    // Remove old article from lists
    removeArticleFromAllLists(slug);

    // Create updated article
    let article = {
      input with
      published = published;
    };

    // Update main articles map
    articles.add(input.slug, article);

    // Update category if needed 
    if (not categories.contains(article.category)) {
      categories.add(article.category);
    };

    // Add to category list
    switch (articlesByCategory.get(input.category)) {
      case (null) {
        let newList = List.empty<ArticleInternal>();
        newList.add(article);
        articlesByCategory.add(article.category, newList);
      };
      case (?existingList) {
        existingList.add(article);
      };
    };

    // Add to pending or trending based on published status
    if (not published) {
      pendingArticles.add(article);
    };
  };

  public shared ({ caller }) func deleteArticle(slug : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete articles");
    };
    if (not articles.containsKey(slug)) {
      Runtime.trap("Article does not exist");
    };
    articles.remove(slug);
    removeArticleFromAllLists(slug);
  };

  public query func getPublishedArticles() : async [ArticleSummary] {
    articles.values().toArray().filter(func(article) { article.published }).map(toSummary);
  };

  public query ({ caller }) func getPendingArticles() : async [ArticleSummary] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view pending articles");
    };
    pendingArticles.toArray().sort(ArticleInternal.compareByPublishDate).map(toSummary);
  };

  public query ({ caller }) func getArticleBySlug(slug : Text) : async ?Article {
    switch (articles.get(slug)) {
      case (?article) {
        // Public can only see published articles, admins can see all
        if (article.published or AccessControl.isAdmin(accessControlState, caller)) {
          ?article;
        } else {
          null;
        };
      };
      case (null) { null };
    };
  };

  public query func checkArticleExists(slug : Text) : async Bool {
    articles.containsKey(slug);
  };

  // User profile functions
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  // Save a user's profile
  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  public type UserProfileInput = {
    name : Text;
  };
};
