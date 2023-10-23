import { Component } from '@angular/core';
import { VideoGalleryLayoutService } from './video-gallery/video-gallery-layout.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  sources = [
    'assets/videos/elon.webm',
    'assets/videos/mark.webm',
    'assets/videos/random.webm'
  ];
  videos: { src: string }[] = [
    { src: 'assets/videos/elon.webm' }
  ];

  constructor(private videoGalleryLayoutService: VideoGalleryLayoutService) {}


  addVideo() : void {
    this.videos.push({src: this.sources[Math.floor(Math.random() * 3)]});
    this.videoGalleryLayoutService.computeLayout();
  }

  onRemoveVideo(index: number): void {
    this.videos.splice(index, 1);
    this.videoGalleryLayoutService.computeLayout();
  }

  removeAllVideos(): void {
    this.videos = [];
  }
}
