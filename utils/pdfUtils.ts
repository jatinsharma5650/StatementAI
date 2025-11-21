export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // Remove data URL prefix (e.g., "data:image/jpeg;base64,")
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = (error) => reject(error);
  });
};

export const convertPdfToImages = async (file: File): Promise<string[]> => {
  if (!window.pdfjsLib) {
    throw new Error("PDF.js library not loaded");
  }

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const images: string[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale: 2.0 }); // Higher scale for better OCR
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    if (context) {
      await page.render({ canvasContext: context, viewport: viewport }).promise;
      const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
      images.push(dataUrl.split(',')[1]); // Push base64 only
    }
  }

  return images;
};

export const processFilesForGemini = async (files: File[]): Promise<{ mimeType: string; data: string }[]> => {
  const parts: { mimeType: string; data: string }[] = [];

  for (const file of files) {
    if (file.type === 'application/pdf') {
      const pdfImages = await convertPdfToImages(file);
      pdfImages.forEach(img => {
        parts.push({ mimeType: 'image/jpeg', data: img });
      });
    } else if (file.type.startsWith('image/')) {
      const base64 = await fileToBase64(file);
      parts.push({ mimeType: file.type, data: base64 });
    }
  }

  return parts;
};