import { Component, ElementRef, EventEmitter, Output, ViewChild, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-video-item',
  templateUrl: './video-item.component.html',
  styleUrls: ['./video-item.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class VideoItemComponent {

  @Output() removeVideo = new EventEmitter<void>();

  @ViewChild('videoWrapper', { static: false }) videoWrapper!: ElementRef;

  onRemoveVideo(): void {
    this.removeVideo.emit();
  }

}
