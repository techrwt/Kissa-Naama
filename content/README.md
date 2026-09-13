# content/ folder — Kahaniyan kaise add karein (Hinglish guide)

Yeh folder KissaNama ki **saari kahaniyan** JSON files mein store karta hai. Website inhi files se automatically ban jaati hai — aapko kabhi bhi HTML edit nahi karni.

## 1. Naya batch kaise banayein

Naya batch matlab kahaniyon ka ek naya group. Bas ek naya file banao:

```
content/batch-3.json
content/batch-4.json
content/batch-5.json
```

Naam hamesha `batch-` se shuru hona chahiye aur `.json` se khatam. Number kuch bhi ho sakta hai — build script automatically **sabhi** `batch-*.json` files ko dhoondh leta hai, chahe kitni bhi ho.

**Important:** File ke andar ek JSON **array** `[ ... ]` hona chahiye, jisme ek ya zyada kahaniyon ke objects hon. Agar sirf ek hi kahani add kar rahe ho, tab bhi use array ke andar `[ {...} ]` rakhna hai.

## 2. Story kaise add karein

`content/story-template.json` file ko copy karo, naye batch file mein paste karo, aur fields fill karo:

| Field | Kya hai | Zaroori? |
|---|---|---|
| `id` | Har story ka unique ID, jaise `kissanama-story-011` | Haan |
| `title` | Kahani ka title (Hindi mein) | Haan |
| `slug` | URL-friendly naam, sirf chhote letters aur hyphen (`-`) | Haan |
| `excerpt` | 1-2 line ka short intro | Haan |
| `story` | Content blocks ka array (neeche dekhein) | Haan |
| `image` | Hero image ka path | Haan |
| `imageAlt` | Hero image ka alt text | Haan |
| `publishedAt` | `YYYY-MM-DD` format mein date | Haan |
| `updatedAt` | Agar kabhi update kiya to naya date | Nahi |
| `author` | Writer ka naam | Haan |
| `readingTime` | Minutes mein padhne ka time (number) | Haan |
| `featured` | `true` sirf ek hi story ke liye rakhein (homepage hero) | Nahi |
| `seo` | Title, description, keywords | Haan (recommended) |

**Yaad rakhein:** KissaNama mein koi "category" system nahi hai. `"category"` naam ka field kabhi add mat karna — build fail ho jayega.

### Story content blocks

`story` array mein alag-alag "blocks" daal sakte ho:

```json
{ "type": "paragraph", "text": "Normal paragraph." }
{ "type": "heading", "text": "Sub-heading", "level": 2 }
{ "type": "quote", "text": "Koi quote ya emotional line." }
{ "type": "image", "src": "assets/images/xyz.png", "alt": "...", "caption": "optional caption" }
{ "type": "separator" }
```

- **Bold text** ke liye: `**yeh bold hoga**`
- **Highlight** ke liye: `==yeh highlight hoga==`
- Kisi bhi paragraph ko highlighted box mein dikhana ho to `"highlight": true` add karein.

## 3. Images kaise add karein

1. Image file ko `assets/images/` folder mein daal do (jaise `assets/images/meri-kahani.png` ya `.webp`/`.jpg`).
2. JSON mein usi path ko `image` field mein likh do: `"image": "assets/images/meri-kahani.png"`.
3. Agar image kabhi missing ho ya galat path ho, to website crash nahi hoga — bas ek simple fallback dikhega.

## 4. Slug kaise banayein

Slug = URL ka last part. Rules:
- Sirf lowercase letters, numbers aur hyphen (`-`)
- Spaces ki jagah hyphen use karein
- Koi special character ya Hindi text nahi

Example: "अंधेरी रात में मिला वो कमरा" ka slug ho sakta hai:
```
andheri-raat-mein-mila-wo-kamra
```

## 5. SEO information kaise add karein

Har story ke andar ek `seo` object rakhein:

```json
"seo": {
  "title": "Aapki kahani ka SEO title | KissaNama",
  "description": "150-160 characters ka description, jo Google mein dikhega.",
  "keywords": ["हिंदी कहानी", "aur relevant keywords"]
}
```

Agar `seo` block nahi diya, to website title/excerpt se automatically ek basic version bana lega — lekin apna khud ka likhna better rahega.

## 6. GitHub par publish kaise karein

1. Naya batch file (`content/batch-N.json`) aur uski images `assets/images/` mein add karein.
2. Local mein ek baar check kar lein: `npm run validate` (sirf JSON check karta hai, koi output nahi banta).
3. Changes ko commit aur push karein:
   ```
   git add content/ assets/
   git commit -m "Add batch-3 stories"
   git push
   ```
4. GitHub Actions automatically build karke website update kar dega (2-3 minute mein).
5. Kuch manually edit karne ki zaroorat nahi — homepage, sitemap, search index, sab automatic ban jaata hai.

Agar JSON mein koi mistake ho (jaise missing comma, ya galat field), to GitHub Actions ka build **fail** ho jayega aur aapko error message mil jayega — website purani state par hi rahegi, kuch broken deploy nahi hoga.
