import { Component, OnInit, OnDestroy } from '@angular/core';
import { RecordingService } from '../recording.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {

  columns = [
    'ref',
    'organisation',
    'meetingdate',
    'date',
    'audiofile',
    'jsonfile',
    'status',
    'transcribedfile'
  ];

  isRecording;
  blob;
  blobUrl;

  subs: Subscription[] = [];

  constructor(private recordingService: RecordingService) { }

  ngOnInit() {
    this.subs.push(this.recordingService.isRecording.subscribe(val => this.isRecording = val));
    this.subs.push(this.recordingService.blob.subscribe(val => this.blob = val));
    this.subs.push(this.recordingService.blobUrl.subscribe(val => this.blobUrl = val));
  }

  ngOnDestroy() {
    this.subs.forEach(s => s.unsubscribe());
  }

  recordButton() {
    if (this.isRecording) {
      this.recordingService.stopRecording();
    } else {
      this.recordingService.startRecording();
    }
  }

  clear() {
    this.recordingService.clearRecording();
  }

  onFileChanged(event) {
    const fileList: FileList = event.target.files;
    const file = fileList[0];
    if (file) {
      this.recordingService.setBlobManual(file);
    }
    event.target.value = '';
  }

}
