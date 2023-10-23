import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class VideoGalleryLayoutService {

  private computeLayoutSource = new Subject<void>();
  computeLayout$ = this.computeLayoutSource.asObservable();

  constructor() { }

  computeLayout() {
    this.computeLayoutSource.next();
  }
}
