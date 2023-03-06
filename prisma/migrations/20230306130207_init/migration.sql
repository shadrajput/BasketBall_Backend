-- CreateTable
CREATE TABLE "Users" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "mobile" TEXT NOT NULL,
    "is_visitor" TEXT NOT NULL,
    "is_player" TEXT NOT NULL,
    "is_manager" TEXT NOT NULL,
    "is_organizer" TEXT NOT NULL,
    "is_admin" TEXT NOT NULL,
    "is_verified" TEXT NOT NULL,
    "token" TEXT NOT NULL,

    CONSTRAINT "Users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_key" ON "Users"("email");
