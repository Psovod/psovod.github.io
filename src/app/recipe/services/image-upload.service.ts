import { Injectable, inject } from '@angular/core';
import { SupabaseService } from './supabase.service';

const BUCKET = 'recipe-images';

@Injectable({ providedIn: 'root' })
export class ImageUploadService {
  private readonly supabase = inject(SupabaseService).client;

  public async uploadRecipeImage(file: File, recipeId: string): Promise<string> {
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const path = `${recipeId}/${Date.now()}-${safeName}`;
    const { error } = await this.supabase.storage
      .from(BUCKET)
      .upload(path, file, { upsert: true, contentType: file.type || undefined });
    if (error) throw error;
    const { data } = this.supabase.storage.from(BUCKET).getPublicUrl(path);
    return data.publicUrl;
  }
}
