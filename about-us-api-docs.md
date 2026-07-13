# About Us Page CMS API Documentation

This document outlines the API endpoints for retrieving and updating the "About Us" page sections on the Crunch Veda backend.

## Base URL
`/api/about-us`

---

## Endpoint Summary

| Method | Endpoint | Auth | Description |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/about-us` | Public | Get the full page CMS data including all sections |
| **GET** | `/api/about-us/banner` | Public | Get the banner section data |
| **PUT** | `/api/about-us/banner` | Admin | Update the banner section (supports file upload) |
| **GET** | `/api/about-us/stewardship` | Public | Get the stewardship section data |
| **PUT** | `/api/about-us/stewardship` | Admin | Update the stewardship section (supports file upload) |
| **GET** | `/api/about-us/journey` | Public | Get the artisanal journey section data |
| **PUT** | `/api/about-us/journey` | Admin | Update the artisanal journey section |
| **GET** | `/api/about-us/quote` | Public | Get the quote section data |
| **PUT** | `/api/about-us/quote` | Admin | Update the quote section |
| **GET** | `/api/about-us/charter` | Public | Get the sustainability charter section data |
| **PUT** | `/api/about-us/charter` | Admin | Update the sustainability charter section |

---

## Endpoints

### 1. Get Entire About Us Page
Returns the full page sections formatted in the standard CMS layout.

* **URL**: `/api/about-us`
* **Method**: `GET`
* **Response**: `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "about-us",
    "title": "About Us CMS Page",
    "records": [
      {
        "id": "about-banner",
        "title": "About Hero Banner",
        "type": "Hero section",
        "status": "Published",
        "fields": [
          { "id": "eyebrow", "label": "Hero subtitle", "type": "text", "value": "EST. 1914" },
          { "id": "headline", "label": "H1 headline", "type": "text", "value": "Cultivating Legacy Through the Seasons" },
          { "id": "description", "label": "Hero paragraph", "type": "textarea", "value": "A century of dedication to the soil..." },
          { "id": "image", "label": "Hero image", "type": "image", "value": "https://ik.imagekit.io/..." },
          { "id": "showSection", "label": "Show section", "type": "toggle", "value": true }
        ]
      },
      {
        "id": "about-stewardship",
        "title": "roots section",
        "type": "Roots content",
        "status": "Published",
        "fields": [
          { "id": "eyebrow", "label": "Eyebrow", "type": "text", "value": "Our Roots" },
          { "id": "heading", "label": "Heading", "type": "text", "value": "A Century of Stewardship" },
          { "id": "description", "label": "Description", "type": "textarea", "value": "For over three generations..." },
          { "id": "quote", "label": "Quote", "type": "textarea", "value": "This is not merely land..." },
          { "id": "badgeNumber", "label": "Badge Number", "type": "text", "value": "100+" },
          { "id": "badgeText", "label": "Badge Text", "type": "text", "value": "Years of Tradition" },
          { "id": "image", "label": "Image", "type": "image", "value": "https://ik.imagekit.io/..." },
          { "id": "showSection", "label": "Show section", "type": "toggle", "value": true }
        ]
      },
      {
        "id": "about-journey",
        "title": "artisanal journey",
        "type": "Artisanal content",
        "status": "Published",
        "fields": [
          { "id": "eyebrow", "label": "Eyebrow", "type": "text", "value": "Our Process" },
          { "id": "heading", "label": "Heading", "type": "text", "value": "The Artisanal Journey" },
          { "id": "steps", "label": "Steps (Title|Desc)", "type": "textarea", "value": "Seed Heritage | Description..." },
          { "id": "imageSet", "label": "Images (Newline separated)", "type": "textarea", "value": "https://ik.imagekit.io/..." },
          { "id": "showSection", "label": "Show section", "type": "toggle", "value": true }
        ]
      },
      {
        "id": "about-quote",
        "title": "quote section",
        "type": "Quote content",
        "status": "Published",
        "fields": [
          { "id": "quote", "label": "Quote", "type": "textarea", "value": "Nature doesn't rush..." },
          { "id": "author", "label": "Author", "type": "text", "value": "— ALBERT CHEN, CHIEF FIELD WARDEN" },
          { "id": "showSection", "label": "Show section", "type": "toggle", "value": true }
        ]
      },
      {
        "id": "about-charter",
        "title": "sustainability charter",
        "type": "Charter content",
        "status": "Published",
        "fields": [
          { "id": "heading", "label": "Heading", "type": "text", "value": "The Sustainability Charter" },
          { "id": "description", "label": "Description", "type": "textarea", "value": "Our commitment to the future..." },
          { "id": "reportLabel", "label": "Report CTA Label", "type": "text", "value": "Read Our Full Report" },
          { "id": "reportHref", "label": "Report Link", "type": "text", "value": "#report" },
          { "id": "charters", "label": "Charters (Title|Desc)", "type": "textarea", "value": "Water Safety | Description..." },
          { "id": "showSection", "label": "Show section", "type": "toggle", "value": true }
        ]
      }
    ]
  }
}
```

---

### 2. Update Banner Section
Updates the hero banner at the top of the About Us page.

* **URL**: `/api/about-us/banner`
* **Method**: `PUT`
* **Headers**: `Authorization: Bearer <ADMIN_JWT_TOKEN>`
* **Content-Type**: `multipart/form-data` or `application/json`
* **Request Fields**:
  - `bannerTitle` (Required, string)
  - `bannerDescription` (Optional, string)
  - `bannerLabel` (Optional, string)
  - `bannerImage` (Optional, string URL fallback)
  - `image` (Optional, file upload)
  - `showSection` (Optional, boolean / "true")

---

### 3. Update Stewardship (Roots) Section
Updates the roots narrative block.

* **URL**: `/api/about-us/stewardship`
* **Method**: `PUT`
* **Headers**: `Authorization: Bearer <ADMIN_JWT_TOKEN>`
* **Content-Type**: `multipart/form-data` or `application/json`
* **Request Fields**:
  - `heading` (Required, string)
  - `description` (Optional, string)
  - `eyebrow` (Optional, string)
  - `quote` (Optional, string)
  - `badgeNumber` (Optional, string)
  - `badgeText` (Optional, string)
  - `image` (Optional, string URL fallback)
  - `image` (Optional, file upload)
  - `showSection` (Optional, boolean / "true")

---

### 4. Update Artisanal Journey Section
Updates the step-by-step process cards.

* **URL**: `/api/about-us/journey`
* **Method**: `PUT`
* **Headers**: `Authorization: Bearer <ADMIN_JWT_TOKEN>`
* **Content-Type**: `application/json`
* **Request Body**:
```json
{
  "heading": "The Artisanal Journey",
  "eyebrow": "Our Process",
  "steps": "Seed Heritage | Description...\nMineral Enrichment | Description...",
  "imageSet": "https://ik.imagekit.io/...\nhttps://ik.imagekit.io/...",
  "showSection": true
}
```

---

### 5. Update Quote Section
Updates the full-width quotation section.

* **URL**: `/api/about-us/quote`
* **Method**: `PUT`
* **Headers**: `Authorization: Bearer <ADMIN_JWT_TOKEN>`
* **Content-Type**: `application/json`
* **Request Body**:
```json
{
  "quote": "Nature doesn't rush, yet everything is accomplished...",
  "author": "— ALBERT CHEN, CHIEF FIELD WARDEN",
  "showSection": true
}
```

---

### 6. Update Sustainability Charter Section
Updates the sustainability grids and report links.

* **URL**: `/api/about-us/charter`
* **Method**: `PUT`
* **Headers**: `Authorization: Bearer <ADMIN_JWT_TOKEN>`
* **Content-Type**: `application/json`
* **Request Body**:
```json
{
  "heading": "The Sustainability Charter",
  "description": "Our commitment to the future...",
  "reportLabel": "Read Our Full Report",
  "reportHref": "#report",
  "charters": "Water Safety | Description...\nCO2 Reduction | Description...",
  "showSection": true
}
```
