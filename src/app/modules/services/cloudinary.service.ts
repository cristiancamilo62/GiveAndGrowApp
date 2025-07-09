import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CloudinaryService {

  private cloudName ='dkedxf8cj';
  private uploadPreset = 'event-images';

  readonly uploading = signal<boolean>(false);

  async uploadImage(file: File): Promise<string> {
    this.uploading.set(true);

    const url = `https://api.cloudinary.com/v1_1/${this.cloudName}/image/upload`;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', this.uploadPreset);

    try {
      const response = await fetch(url, { method: 'POST', body: formData });
      const data = await response.json();
      if (!data.secure_url) throw new Error('Image upload failed');
      return data.secure_url;
    } finally {
      this.uploading.set(false);
    }
    
    
  }

  constructor() { }
}
