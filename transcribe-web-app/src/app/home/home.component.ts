import { Component, OnInit, OnDestroy } from '@angular/core';
import { RecordingService } from '../recording.service';
import { Subscription } from 'rxjs';
import { TranscribeJobModel, TranscribeGatewayService } from '../transcribe-gateway.service';
import { S3UploaderService } from '../s3-uploader.service';
import { FormControl, AbstractControl } from '@angular/forms';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {

  columns = [
    'name',
    // 'organisation',
    // 'meetingdate',
    // 'date',
    'audiofile',
    'jsonfile',
    'status',
    'transcribedfile'
  ];

  isRecording;
  blob;
  blobUrl;
  jobs: TranscribeJobModel[] = [];
  fileNameControl = new FormControl(null, this.invalid);

  subs: Subscription[] = [];

  constructor(private recordingService: RecordingService,
              private transcribeGatewayService: TranscribeGatewayService,
              private s3UploaderService: S3UploaderService) { }

  ngOnInit() {
    this.subs.push(this.recordingService.isRecording.subscribe(val => this.isRecording = val));
    this.subs.push(this.recordingService.blob.subscribe(val => this.blob = val));
    this.subs.push(this.recordingService.blobUrl.subscribe(val => this.blobUrl = val));
    this.loadJobs();
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

  transcribe() {
    if (this.blob == null) { return; }
    let extension = '.mp3';
    if (this.blob.type.endsWith('wav')) {
      extension = '.wav';
    }
    const name = `${this.fileNameControl.value}${extension}`;
    this.s3UploaderService.uploadFile(this.blob, name).subscribe(() => {
      this.clear();
      this.loadJobs();
    });
  }

  loadJobs() {
    this.transcribeGatewayService.getTranscriptionJobs().subscribe(data => {
      this.jobs = data;
    });
  }

  download(key: string) {
    if (key) {
      this.s3UploaderService.downloadFile(key);
    }
  }

  invalid(formControl: AbstractControl) {
    if (!formControl.value) {
      return {'required': true};
    }
    if (formControl.value.indexOf(' ') !== -1) {
      return {'invalidname': true} ;
    }
    return null;
  }

}
