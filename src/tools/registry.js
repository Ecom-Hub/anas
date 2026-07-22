import { lazy } from 'react'

export const categories = [
  'File Conversion',
  'Image Tools',
  'PDF Tools',
  'Dev & Text',
  'Design',
  'Security',
]

export const tools = [
  // File Conversion
  { id: 'csv-json', category: 'File Conversion', name: 'CSV ⇄ JSON', desc: 'Convert CSV files to JSON and back.', icon: '⇄', component: lazy(() => import('./CsvJsonConverter')) },
  { id: 'csv-excel', category: 'File Conversion', name: 'CSV ⇄ Excel', desc: 'Convert between CSV and .xlsx spreadsheets.', icon: '📊', component: lazy(() => import('./CsvExcelConverter')) },
  { id: 'json-yaml', category: 'File Conversion', name: 'JSON ⇄ YAML', desc: 'Convert config files between JSON and YAML.', icon: '{}', component: lazy(() => import('./JsonYamlConverter')) },
  { id: 'md-html', category: 'File Conversion', name: 'Markdown ⇄ HTML', desc: 'Convert Markdown to HTML or HTML to Markdown.', icon: '📝', component: lazy(() => import('./MarkdownHtmlConverter')) },
  { id: 'images-pdf', category: 'File Conversion', name: 'Images → PDF', desc: 'Combine one or more images into a single PDF.', icon: '🖼️', component: lazy(() => import('./ImagesToPdf')) },
  { id: 'pdf-images', category: 'File Conversion', name: 'PDF → Images', desc: 'Export every page of a PDF as a PNG image.', icon: '📄', component: lazy(() => import('./PdfToImages')) },
  { id: 'text-pdf', category: 'File Conversion', name: 'Text/HTML → PDF', desc: 'Turn plain text or simple HTML into a PDF.', icon: '📃', component: lazy(() => import('./TextHtmlToPdf')) },
  { id: 'docx-pdf', category: 'File Conversion', name: 'Word (.docx) → PDF', desc: 'Convert a Word document into a PDF.', icon: '📘', component: lazy(() => import('./WordToPdf')) },

  // Image Tools
  { id: 'bg-remove', category: 'Image Tools', name: 'Background Remover', desc: 'Remove the background from a photo automatically.', icon: '✂️', badge: 'First use downloads a model', component: lazy(() => import('./BackgroundRemover')) },
  { id: 'img-resize', category: 'Image Tools', name: 'Image Resizer', desc: 'Resize an image to exact width and height.', icon: '↔️', component: lazy(() => import('./ImageResizer')) },
  { id: 'img-compress', category: 'Image Tools', name: 'Image Compressor', desc: 'Shrink file size while keeping quality.', icon: '🗜️', component: lazy(() => import('./ImageCompressor')) },
  { id: 'img-format', category: 'Image Tools', name: 'Format Converter', desc: 'Convert between PNG, JPG, and WebP.', icon: '🔄', component: lazy(() => import('./ImageFormatConverter')) },
  { id: 'img-crop', category: 'Image Tools', name: 'Image Cropper', desc: 'Crop an image to the area you need.', icon: '✂️', component: lazy(() => import('./ImageCropper')) },
  { id: 'img-watermark', category: 'Image Tools', name: 'Watermark', desc: 'Stamp text over an image.', icon: '💧', component: lazy(() => import('./ImageWatermark')) },

  // PDF Tools
  { id: 'pdf-merge', category: 'PDF Tools', name: 'Merge PDFs', desc: 'Combine multiple PDFs into one file.', icon: '📚', component: lazy(() => import('./PdfMerge')) },
  { id: 'pdf-split', category: 'PDF Tools', name: 'Split PDF', desc: 'Pull specific pages out into a new PDF.', icon: '✂️', component: lazy(() => import('./PdfSplit')) },
  { id: 'pdf-compress', category: 'PDF Tools', name: 'Compress PDF', desc: 'Reduce a PDF\u2019s file size.', icon: '📉', component: lazy(() => import('./PdfCompress')) },

  // Dev & Text
  { id: 'json-format', category: 'Dev & Text', name: 'JSON Formatter', desc: 'Validate and pretty-print JSON.', icon: '{ }', component: lazy(() => import('./JsonFormatter')) },
  { id: 'base64', category: 'Dev & Text', name: 'Base64 Encode/Decode', desc: 'Convert text to and from Base64.', icon: '🔐', component: lazy(() => import('./Base64Tool')) },
  { id: 'url-encode', category: 'Dev & Text', name: 'URL Encode/Decode', desc: 'Escape or unescape a URL.', icon: '🔗', component: lazy(() => import('./UrlEncodeTool')) },
  { id: 'hash-gen', category: 'Dev & Text', name: 'Hash Generator', desc: 'Generate MD5 / SHA-1 / SHA-256 hashes.', icon: '#️⃣', component: lazy(() => import('./HashGenerator')) },
  { id: 'word-count', category: 'Dev & Text', name: 'Word & Character Counter', desc: 'Count words, characters, and reading time.', icon: '🔢', component: lazy(() => import('./WordCounter')) },
  { id: 'regex-test', category: 'Dev & Text', name: 'Regex Tester', desc: 'Test a regular expression against sample text.', icon: '.*', component: lazy(() => import('./RegexTester')) },

  // Design
  { id: 'color-palette', category: 'Design', name: 'Color Palette Generator', desc: 'Generate a palette from one base color.', icon: '🎨', component: lazy(() => import('./ColorPaletteGenerator')) },
  { id: 'gradient-gen', category: 'Design', name: 'Gradient Generator', desc: 'Build a CSS gradient visually.', icon: '🌈', component: lazy(() => import('./GradientGenerator')) },
  { id: 'color-extract', category: 'Design', name: 'Extract Colors From Image', desc: 'Pull the dominant colors out of a photo.', icon: '🧪', component: lazy(() => import('./ImageColorExtractor')) },

  // Security
  { id: 'pass-gen', category: 'Security', name: 'Password Generator', desc: 'Generate a strong random password.', icon: '🔑', component: lazy(() => import('./PasswordGenerator')) },
  { id: 'pass-strength', category: 'Security', name: 'Password Strength Checker', desc: 'Check how strong a password is.', icon: '🛡️', component: lazy(() => import('./PasswordStrength')) },
]
