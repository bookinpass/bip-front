import { NgZone, OnChanges, SimpleChanges, TemplateRef } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { DateAdapter } from '../../date-adapters/date-adapter';
import * as ɵngcc0 from '@angular/core';
export declare class CalendarWeekViewCurrentTimeMarkerComponent implements OnChanges {
    private dateAdapter;
    private zone;
    columnDate: Date;
    dayStartHour: number;
    dayStartMinute: number;
    dayEndHour: number;
    dayEndMinute: number;
    hourSegments: number;
    hourSegmentHeight: number;
    customTemplate: TemplateRef<any>;
    columnDate$: BehaviorSubject<Date>;
    marker$: Observable<{
        isVisible: boolean;
        top: number;
    }>;
    constructor(dateAdapter: DateAdapter, zone: NgZone);
    ngOnChanges(changes: SimpleChanges): void;
    static ɵfac: ɵngcc0.ɵɵFactoryDef<CalendarWeekViewCurrentTimeMarkerComponent, never>;
    static ɵcmp: ɵngcc0.ɵɵComponentDefWithMeta<CalendarWeekViewCurrentTimeMarkerComponent, "mwl-calendar-week-view-current-time-marker", never, { "columnDate": "columnDate"; "dayStartHour": "dayStartHour"; "dayStartMinute": "dayStartMinute"; "dayEndHour": "dayEndHour"; "dayEndMinute": "dayEndMinute"; "hourSegments": "hourSegments"; "hourSegmentHeight": "hourSegmentHeight"; "customTemplate": "customTemplate"; }, {}, never, never>;
}

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2FsZW5kYXItd2Vlay12aWV3LWN1cnJlbnQtdGltZS1tYXJrZXIuY29tcG9uZW50LmQudHMiLCJzb3VyY2VzIjpbImNhbGVuZGFyLXdlZWstdmlldy1jdXJyZW50LXRpbWUtbWFya2VyLmNvbXBvbmVudC5kLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTs7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQUNBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgTmdab25lLCBPbkNoYW5nZXMsIFNpbXBsZUNoYW5nZXMsIFRlbXBsYXRlUmVmIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBCZWhhdmlvclN1YmplY3QsIE9ic2VydmFibGUgfSBmcm9tICdyeGpzJztcbmltcG9ydCB7IERhdGVBZGFwdGVyIH0gZnJvbSAnLi4vLi4vZGF0ZS1hZGFwdGVycy9kYXRlLWFkYXB0ZXInO1xuZXhwb3J0IGRlY2xhcmUgY2xhc3MgQ2FsZW5kYXJXZWVrVmlld0N1cnJlbnRUaW1lTWFya2VyQ29tcG9uZW50IGltcGxlbWVudHMgT25DaGFuZ2VzIHtcbiAgICBwcml2YXRlIGRhdGVBZGFwdGVyO1xuICAgIHByaXZhdGUgem9uZTtcbiAgICBjb2x1bW5EYXRlOiBEYXRlO1xuICAgIGRheVN0YXJ0SG91cjogbnVtYmVyO1xuICAgIGRheVN0YXJ0TWludXRlOiBudW1iZXI7XG4gICAgZGF5RW5kSG91cjogbnVtYmVyO1xuICAgIGRheUVuZE1pbnV0ZTogbnVtYmVyO1xuICAgIGhvdXJTZWdtZW50czogbnVtYmVyO1xuICAgIGhvdXJTZWdtZW50SGVpZ2h0OiBudW1iZXI7XG4gICAgY3VzdG9tVGVtcGxhdGU6IFRlbXBsYXRlUmVmPGFueT47XG4gICAgY29sdW1uRGF0ZSQ6IEJlaGF2aW9yU3ViamVjdDxEYXRlPjtcbiAgICBtYXJrZXIkOiBPYnNlcnZhYmxlPHtcbiAgICAgICAgaXNWaXNpYmxlOiBib29sZWFuO1xuICAgICAgICB0b3A6IG51bWJlcjtcbiAgICB9PjtcbiAgICBjb25zdHJ1Y3RvcihkYXRlQWRhcHRlcjogRGF0ZUFkYXB0ZXIsIHpvbmU6IE5nWm9uZSk7XG4gICAgbmdPbkNoYW5nZXMoY2hhbmdlczogU2ltcGxlQ2hhbmdlcyk6IHZvaWQ7XG59XG4iXX0=