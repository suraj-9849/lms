-- CreateTable
CREATE TABLE "Video" (
    "video_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "course_id" INTEGER NOT NULL,
    "uploader_id" TEXT NOT NULL,

    CONSTRAINT "Video_pkey" PRIMARY KEY ("video_id")
);

-- AddForeignKey
ALTER TABLE "Video" ADD CONSTRAINT "Video_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "Course"("course_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Video" ADD CONSTRAINT "Video_uploader_id_fkey" FOREIGN KEY ("uploader_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;
