-- CREATE TABLE "User" (
--     "id" INTEGER PRIMARY KEY AUTOINCREMENT,
--     "username" TEXT NOT NULL,
--     "password" TEXT NOT NULL,
--     "email" TEXT NOT NULL UNIQUE,
--     "created_at" TEXT NOT NULL,
--     "updated_at" TEXT NOT NULL
-- )

-- Add avatar column to User table
ALTER TABLE "User" ADD COLUMN "avatar" TEXT NOT NULL DEFAULT '/user.png';