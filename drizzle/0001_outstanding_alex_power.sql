CREATE TYPE "public"."reaction_type" AS ENUM('like', 'dislike');--> statement-breakpoint
CREATE TYPE "public"."video_visibility" AS ENUM('public', 'private');--> statement-breakpoint
CREATE TABLE "video_reactions" (
	"user_id" uuid NOT NULL,
	"video_id" uuid NOT NULL,
	"reaction" "reaction_type" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "video_reaction_pk" PRIMARY KEY("user_id","video_id")
);
--> statement-breakpoint
CREATE TABLE "video_views" (
	"user_id" uuid NOT NULL,
	"video_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "video_view_pk" PRIMARY KEY("user_id","video_id")
);
--> statement-breakpoint
ALTER TABLE "videos" RENAME COLUMN "url" TO "mux_status";--> statement-breakpoint
ALTER TABLE "videos" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "videos" ALTER COLUMN "updated_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "videos" ADD COLUMN "mux_asset_id" text;--> statement-breakpoint
ALTER TABLE "videos" ADD COLUMN "mux_upload_id" text;--> statement-breakpoint
ALTER TABLE "videos" ADD COLUMN "mux_playback_id" text;--> statement-breakpoint
ALTER TABLE "videos" ADD COLUMN "mux_track_id" text;--> statement-breakpoint
ALTER TABLE "videos" ADD COLUMN "mux_track_status" text;--> statement-breakpoint
ALTER TABLE "videos" ADD COLUMN "thumbnail_url" text;--> statement-breakpoint
ALTER TABLE "videos" ADD COLUMN "thumbnail_key" text;--> statement-breakpoint
ALTER TABLE "videos" ADD COLUMN "preview_url" text;--> statement-breakpoint
ALTER TABLE "videos" ADD COLUMN "preview_key" text;--> statement-breakpoint
ALTER TABLE "videos" ADD COLUMN "duration" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "videos" ADD COLUMN "visibility" "video_visibility" DEFAULT 'private' NOT NULL;--> statement-breakpoint
ALTER TABLE "video_reactions" ADD CONSTRAINT "video_reactions_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "video_reactions" ADD CONSTRAINT "video_reactions_video_id_videos_id_fk" FOREIGN KEY ("video_id") REFERENCES "public"."videos"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "video_views" ADD CONSTRAINT "video_views_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "video_views" ADD CONSTRAINT "video_views_video_id_videos_id_fk" FOREIGN KEY ("video_id") REFERENCES "public"."videos"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "videos" ADD CONSTRAINT "videos_mux_asset_id_unique" UNIQUE("mux_asset_id");--> statement-breakpoint
ALTER TABLE "videos" ADD CONSTRAINT "videos_mux_upload_id_unique" UNIQUE("mux_upload_id");--> statement-breakpoint
ALTER TABLE "videos" ADD CONSTRAINT "videos_mux_playback_id_unique" UNIQUE("mux_playback_id");--> statement-breakpoint
ALTER TABLE "videos" ADD CONSTRAINT "videos_mux_track_id_unique" UNIQUE("mux_track_id");