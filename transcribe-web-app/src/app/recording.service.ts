import { Injectable } from '@angular/core';
import * as MicRecorder from 'mic-recorder-to-mp3';
import { BehaviorSubject } from 'rxjs';
import { DomSanitizer } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root'
})
export class RecordingService {

  private isRecordingSubject = new BehaviorSubject<boolean>(false);
  private blobUrlSubject = new BehaviorSubject<any>(null);
  private blobSubject = new BehaviorSubject<any>(null);
  private recorder;

  get isRecording() {
    return this.isRecordingSubject.asObservable();
  }

  get blobUrl() {
    return this.blobUrlSubject.asObservable();
  }

  get blob() {
    return this.blobSubject.asObservable();
  }

  constructor(private sanitizer: DomSanitizer) {
    this.recorder = new MicRecorder({
      bitRate: 128
    });
  }

  startRecording() {
    this.recorder.start().then(() => {
      this.isRecordingSubject.next(true);
    }).catch(err => {
      alert('Cannot start recording. Please check if microphone is available.');
      console.error(err);
    });
  }

  stopRecording() {
    this.recorder.stop().getMp3().then(([buffer, blob]) => {
      const file = new File(buffer, 'test.mp3', {
        type: blob.type,
        lastModified: Date.now()
      });
      this.blobSubject.next(file);
      this.blobUrlSubject.next(this.sanitizer.bypassSecurityTrustUrl(URL.createObjectURL(file)));
      this.isRecordingSubject.next(false);
    }).catch(err => console.error(err));
  }

  clearRecording() {
    this.blobSubject.next(null);
    this.blobUrlSubject.next(null);
  }

  setBlobManual(file) {
    this.blobSubject.next(file);
    this.blobUrlSubject.next(this.sanitizer.bypassSecurityTrustUrl(URL.createObjectURL(file)));
  }
}
