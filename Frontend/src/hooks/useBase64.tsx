import { useState } from "react";

const useBase64 = () => {
  const [base64List, setBase64List] = useState<string[]>([]);
  const [errors, setErrors] = useState<Error[]>([]);

  const processImagesToBase64 = (images: File[]) => {
    reset();

    images.forEach((image) => {
      const fileReader = new FileReader();
      fileReader.onload = () => {
        const base64String = fileReader.result as string;
        setBase64List((prev) => [...prev, base64String]);
      };
      fileReader.onerror = (error) => {
        setErrors((prev) => [
          ...prev,
          new Error(`Failed to read file: ${image.name}`),
        ]);
        console.error("FileReader error:", error);
      };
      fileReader.readAsDataURL(image);
    });
  };

  const reset = () => {
    setBase64List([]);
    setErrors([]);
  };

  return { base64List, errors, processImagesToBase64, reset };
};

export default useBase64;
