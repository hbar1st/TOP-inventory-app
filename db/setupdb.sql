CREATE TABLE "brands" (
  "brand_id" INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  "brand_name" VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE "categories" (
  "category_id" INT GENERATED ALWAYS AS IDENTITY UNIQUE,
  "category_name" VARCHAR(50) NOT NULL DEFAULT 'category name missing',
  "type" VARCHAR(30),
  PRIMARY KEY ("type", "category_name")
);

CREATE TABLE "perfumes" (
  "description" VARCHAR(300) DEFAULT 'description missing',
  "image_url" VARCHAR(2048) NOT NULL DEFAULT 'image missing',
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT (NOW()),
  "perfume_name" VARCHAR(50) NOT NULL UNIQUE,
  "perfume_id" INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY
);

CREATE TABLE "perfume_brand" (
  "brand_id" INT NOT NULL REFERENCES brands ON DELETE RESTRICT,
  "perfume_id" INT NOT NULL REFERENCES perfumes ON DELETE CASCADE,
  PRIMARY KEY ("perfume_id", "brand_id")
);

CREATE TABLE "perfume_price" (
  "perfume_price_id" INT GENERATED ALWAYS AS IDENTITY UNIQUE NOT NULL,
  "perfume_id" INT NOT NULL REFERENCES perfumes ON DELETE CASCADE,
  "price" NUMERIC(6,2) NOT NULL CHECK (price > 0),
  PRIMARY KEY ("perfume_id", "price")
);

CREATE TABLE "perfume_category" (
  "perfume_id" INT NOT NULL REFERENCES perfumes ON DELETE CASCADE,
  "category_id" INT NOT NULL REFERENCES categories (category_id) ON DELETE CASCADE,
  PRIMARY KEY ("perfume_id", "category_id")
);

CREATE TABLE "inventory" (
  "perfume_price_id" INT PRIMARY KEY REFERENCES perfume_price ("perfume_price_id") ON DELETE CASCADE,
  "date_updated" TIMESTAMPTZ NOT NULL DEFAULT (NOW()),
  "count" INT NOT NULL DEFAULT 0
);