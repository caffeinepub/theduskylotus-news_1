import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Loader2, Upload } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ExternalBlob } from "../backend";
import {
  useArticleBySlug,
  useCreateArticle,
  useUpdateArticle,
} from "../hooks/useQueries";
import { generateSlug } from "../utils/slug";

const CATEGORIES = [
  "Politics",
  "World",
  "Culture",
  "Voices",
  "The Arts",
  "Design",
];

interface EditorMode {
  mode: "new" | "edit";
  editSlug?: string;
}

export function ArticleEditorPage({ mode, editSlug }: EditorMode) {
  const navigate = useNavigate();
  const createMutation = useCreateArticle();
  const updateMutation = useUpdateArticle();

  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [category, setCategory] = useState("");
  const [slug, setSlug] = useState("");
  const [body, setBody] = useState("");
  const [published, setPublished] = useState(false);
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [existingCoverUrl, setExistingCoverUrl] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [slugEdited, setSlugEdited] = useState(false);

  const { data: existingArticle, isLoading: loadingExisting } =
    useArticleBySlug(mode === "edit" && editSlug ? editSlug : "");

  useEffect(() => {
    if (mode === "edit" && existingArticle) {
      setTitle(existingArticle.title);
      setSubtitle(existingArticle.subtitle ?? "");
      setCategory(existingArticle.category);
      setSlug(existingArticle.slug);
      setBody(existingArticle.body);
      setPublished(existingArticle.published);
      setExistingCoverUrl(existingArticle.coverImage.getDirectURL());
      setSlugEdited(true);
    }
  }, [existingArticle, mode]);

  useEffect(() => {
    if (!slugEdited && title) {
      setSlug(generateSlug(title));
    }
  }, [title, slugEdited]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverImageFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setCoverPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const triggerFileInput = () => {
    document.getElementById("cover-input")?.click();
  };

  const handleSubmit = async (asDraft: boolean) => {
    if (!title || !category || !body) {
      toast.error("Please fill in Title, Category, and Body.");
      return;
    }
    if (mode === "new" && !coverImageFile) {
      toast.error("Please upload a cover image.");
      return;
    }

    setIsSubmitting(true);
    try {
      let coverBlob: ExternalBlob;

      if (coverImageFile) {
        const arrayBuffer = await coverImageFile.arrayBuffer();
        const uint8 = new Uint8Array(arrayBuffer);
        coverBlob = ExternalBlob.fromBytes(uint8).withUploadProgress((pct) =>
          setUploadProgress(pct),
        );
      } else if (mode === "edit" && existingArticle) {
        coverBlob = existingArticle.coverImage;
      } else {
        toast.error("No cover image available.");
        return;
      }

      const input = {
        title,
        subtitle: subtitle || undefined,
        body,
        category,
        slug,
        publishDate: BigInt(Date.now()) * BigInt(1_000_000),
        coverImage: coverBlob,
      };

      if (mode === "new") {
        await createMutation.mutateAsync(input);
        toast.success(asDraft ? "Draft saved!" : "Article published!");
      } else if (editSlug) {
        await updateMutation.mutateAsync({
          slug: editSlug,
          input,
          published: !asDraft,
        });
        toast.success(asDraft ? "Draft saved!" : "Article published!");
      }

      navigate({ to: "/admin" });
    } catch (_e) {
      toast.error("Failed to save article. Please try again.");
    } finally {
      setIsSubmitting(false);
      setUploadProgress(0);
    }
  };

  if (mode === "edit" && loadingExisting) {
    return (
      <div
        className="flex items-center justify-center min-h-[60vh]"
        data-ocid="editor.loading_state"
      >
        <Loader2 className="animate-spin text-wine-vibrant" size={40} />
      </div>
    );
  }

  return (
    <main className="max-w-[900px] mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link to="/admin">
            <Button variant="ghost" size="icon" className="text-wine-dark">
              <ArrowLeft size={20} />
            </Button>
          </Link>
          <h1 className="editorial-heading text-wine-darkest text-3xl">
            {mode === "new" ? "New Article" : "Edit Article"}
          </h1>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Cover image */}
        <div>
          <Label className="category-meta text-wine-dark text-[0.7rem] tracking-wider mb-2 block">
            COVER IMAGE
          </Label>
          <button
            type="button"
            className="relative border-2 border-dashed border-border hover:border-wine-DEFAULT transition-colors h-48 w-full overflow-hidden cursor-pointer text-left"
            onClick={triggerFileInput}
            data-ocid="editor.dropzone"
          >
            {coverPreview || existingCoverUrl ? (
              <img
                src={coverPreview ?? existingCoverUrl ?? ""}
                alt="Cover preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <Upload size={32} className="mb-2 text-wine-DEFAULT" />
                <p className="text-sm">Click to upload cover image</p>
                <p className="text-xs text-muted-foreground/60">
                  JPG, PNG, WEBP supported
                </p>
              </div>
            )}
            {uploadProgress > 0 && uploadProgress < 100 && (
              <div className="absolute bottom-0 left-0 right-0 bg-wine-darkest/80 px-3 py-1">
                <div
                  className="bg-wine-vibrant h-1.5 transition-all"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            )}
          </button>
          <input
            id="cover-input"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageChange}
            data-ocid="editor.upload_button"
          />
        </div>

        {/* Title */}
        <div>
          <Label className="category-meta text-wine-dark text-[0.7rem] tracking-wider mb-2 block">
            TITLE *
          </Label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter article headline..."
            data-ocid="editor.input"
            className="font-serif text-xl border-border focus:border-wine-DEFAULT"
          />
        </div>

        {/* Subtitle */}
        <div>
          <Label className="category-meta text-wine-dark text-[0.7rem] tracking-wider mb-2 block">
            SUBTITLE / DECK
          </Label>
          <Input
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            placeholder="Brief subheading or teaser..."
            className="border-border focus:border-wine-DEFAULT"
          />
        </div>

        {/* Category + Slug row */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="category-meta text-wine-dark text-[0.7rem] tracking-wider mb-2 block">
              CATEGORY *
            </Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger
                data-ocid="editor.select"
                className="border-border focus:border-wine-DEFAULT"
              >
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="category-meta text-wine-dark text-[0.7rem] tracking-wider mb-2 block">
              SLUG (URL)
            </Label>
            <Input
              value={slug}
              onChange={(e) => {
                setSlug(e.target.value);
                setSlugEdited(true);
              }}
              placeholder="article-url-slug"
              className="border-border focus:border-wine-DEFAULT font-mono text-sm"
            />
            {slug && (
              <p className="text-xs text-muted-foreground mt-1">
                URL: /article/{slug}
              </p>
            )}
          </div>
        </div>

        {/* Body */}
        <div>
          <Label className="category-meta text-wine-dark text-[0.7rem] tracking-wider mb-2 block">
            BODY (MARKDOWN) *
          </Label>
          <Textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Write your article in Markdown format..."
            data-ocid="editor.textarea"
            rows={18}
            className="font-mono text-sm border-border focus:border-wine-DEFAULT resize-y"
          />
        </div>

        {/* Publish toggle + actions */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4 border-t border-border">
          <div className="flex items-center gap-3">
            <Switch
              checked={published}
              onCheckedChange={setPublished}
              data-ocid="editor.switch"
            />
            <Label className="category-meta text-[0.7rem] tracking-wider text-wine-dark">
              {published ? "PUBLISH NOW" : "SAVE AS DRAFT"}
            </Label>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => handleSubmit(true)}
              disabled={isSubmitting}
              data-ocid="editor.secondary_button"
              className="category-meta border-wine-DEFAULT text-wine-DEFAULT hover:bg-wine-DEFAULT hover:text-cream-DEFAULT tracking-wider"
            >
              {isSubmitting ? (
                <Loader2 className="animate-spin h-4 w-4" />
              ) : (
                "SAVE DRAFT"
              )}
            </Button>
            <Button
              onClick={() => handleSubmit(false)}
              disabled={isSubmitting}
              data-ocid="editor.submit_button"
              className="bg-wine-vibrant hover:bg-wine-DEFAULT text-cream-DEFAULT category-meta tracking-wider"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin h-4 w-4 mr-2" />
                  PUBLISHING...
                </>
              ) : (
                "PUBLISH"
              )}
            </Button>
          </div>
        </div>
      </motion.div>
    </main>
  );
}
