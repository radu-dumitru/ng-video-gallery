import {
  AfterViewInit,
  Component,
  ContentChildren,
  ElementRef,
  OnDestroy,
  OnInit,
  QueryList,
  ViewChild
} from '@angular/core';
import { merge, Subject, Subscription } from 'rxjs';
import { debounceTime, delay, startWith } from 'rxjs/operators';
import { VideoItemComponent } from '../video-item/video-item.component';
import { VideoGalleryLayoutService } from './video-gallery-layout.service';

interface VideoGalleryDetails {
  width: number;
  height: number;
  videoCount: number;
  desiredAspectRatio: number;
}

interface VideoGalleryLayout {
  cols: number;
  rows: number;
  videoItemWidth: number;
  videoItemHeight: number;
  videoItemArea: number;
}

@Component({
  selector: 'app-video-gallery',
  templateUrl: './video-gallery.component.html',
  styleUrls: ['./video-gallery.component.scss']
})
export class VideoGalleryComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild('videoGallery', { static: false }) videoGallery!: ElementRef;
  @ContentChildren(VideoItemComponent) videoItems: QueryList<VideoItemComponent> | undefined;

  resizeVideoGalleryObserver!: ResizeObserver;
  onSizeChangedSubject = new Subject<void>();
  computeLayoutSubscription!: Subscription;

  constructor(
    private videoGalleryLayoutService: VideoGalleryLayoutService
  ) { }

  ngOnInit(): void {
    this.computeLayoutSubscription = merge(
      this.videoGalleryLayoutService.computeLayout$
      .pipe(delay(300)),
      this.onSizeChangedSubject
      .asObservable()
      .pipe(
        debounceTime(300),
        startWith(null)
      )
    ).subscribe(() => {
      if (this.videoItems?.length) {
        const videoGalleryWidth = this.videoGallery.nativeElement.getBoundingClientRect().width;
        const videoGalleryHeight = this.videoGallery.nativeElement.getBoundingClientRect().height;

        console.log(videoGalleryWidth, videoGalleryHeight);

        let highestSizeVideo = null;
        let highestSize = 0;

        for (const videoItem of this.videoItems) {
          const video = videoItem.videoWrapper.nativeElement.querySelector('video');
          if (video.videoWidth && video.videoHeight) {
            const size = video.videoWidth * video.videoHeight;

            if (size > highestSize) {
              highestSize = size;
              highestSizeVideo = video;
            }
          }
        }

        const aspectRatio = highestSizeVideo.videoWidth / highestSizeVideo.videoHeight;

        const result = this.computeLayout({
          width: videoGalleryWidth,
          height: videoGalleryHeight,
          desiredAspectRatio: aspectRatio,
          videoCount: this.videoItems.length
        });

        console.log(result);

        this.videoGallery.nativeElement.style.setProperty('--w', result.videoItemWidth + 'px');
        this.videoGallery.nativeElement.style.setProperty('--h', result.videoItemHeight + 'px');
        this.videoGallery.nativeElement.style.setProperty('--cols', result.cols + '');
      }
    });
  }

  ngAfterViewInit(): void {
    this.resizeVideoGalleryObserver = new ResizeObserver(() => {
      this.onSizeChangedSubject.next();
    });

    this.resizeVideoGalleryObserver.observe(this.videoGallery.nativeElement);
  }

  private computeLayout(videoGalleryDetails: VideoGalleryDetails): VideoGalleryLayout {
    let bestLayout: VideoGalleryLayout = {
      cols: 0,
      rows: 0,
      videoItemWidth: 0,
      videoItemHeight: 0,
      videoItemArea: 0,
    };

    for (let cols = videoGalleryDetails.videoCount; cols > 0; cols -= 1) {
      const rows = Math.ceil(videoGalleryDetails.videoCount / cols);
      const hScale = videoGalleryDetails.width / (cols * videoGalleryDetails.desiredAspectRatio);
      const vScale = videoGalleryDetails.height / rows;

      let width;
      let height;

      if (hScale <= vScale) {
        width = videoGalleryDetails.width / cols;
        height = width / videoGalleryDetails.desiredAspectRatio;
      } else {
        height = videoGalleryDetails.height / rows;
        width = height * videoGalleryDetails.desiredAspectRatio;
      }

      const area = width * height;
      if (area > bestLayout.videoItemArea) {
        bestLayout = {
          videoItemArea: area,
          videoItemWidth: width,
          videoItemHeight: height,
          rows,
          cols
        };
      }
    }
    return bestLayout;
  }

  ngOnDestroy(): void {
    if (this.resizeVideoGalleryObserver) {
      this.resizeVideoGalleryObserver.disconnect();
    }

    if (this.computeLayoutSubscription) {
      this.computeLayoutSubscription.unsubscribe();
    }
  }
}
