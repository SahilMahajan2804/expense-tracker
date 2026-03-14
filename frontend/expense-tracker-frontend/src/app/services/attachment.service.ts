import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Attachment } from '../models/attachment.model';

@Injectable({
  providedIn: 'root',
})
export class AttachmentService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/api/attachments`;

  uploadFile(expenseId: number, file: File): Observable<Attachment> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<Attachment>(`${this.apiUrl}/expense/${expenseId}`, formData);
  }

  uploadMultipleFiles(expenseId: number, files: File[]): Observable<Attachment[]> {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));
    return this.http.post<Attachment[]>(`${this.apiUrl}/expense/${expenseId}/multiple`, formData);
  }

  getAttachmentsByExpense(expenseId: number): Observable<Attachment[]> {
    return this.http.get<Attachment[]>(`${this.apiUrl}/expense/${expenseId}`);
  }

  downloadFile(attachmentId: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/download/${attachmentId}`, { responseType: 'blob' });
  }

  deleteAttachment(attachmentId: number): Observable<string> {
    return this.http.delete<string>(`${this.apiUrl}/${attachmentId}`);
  }
}
