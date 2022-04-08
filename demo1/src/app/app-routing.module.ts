import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {AuthGuard} from './modules/auth/_services/auth.guard';
import {QuanlyComponent} from './pages/quanly/quanly.component';

export const routes: Routes = [
    {
        path: 'auth',
        loadChildren: () =>
            import('./modules/auth/auth.module').then((m) => m.AuthModule),
    },
    {
        path: 'error',
        loadChildren: () =>
            import('./modules/errors/errors.module').then((m) => m.ErrorsModule),
    },
    {
        path: '',
        canActivate: [AuthGuard],
        loadChildren: () =>
            import('./pages/layout.module').then((m) => m.LayoutModule),
    },
    // {path: 'quanly', component: QuanlyComponent},
    // {path: '', component: QuanlyComponent},
    {path: '**', redirectTo: 'error/404'},
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule],
})
export class AppRoutingModule {
}

// path: đường dẫn đến một component 'quanly' -> tên router
// Vậy ko cần thiết lập routing ở app-routing, mà chỉ cần thiết lập ở page-routing là được
// nhưng vẫn đặt router-outlet ở app.component.html
