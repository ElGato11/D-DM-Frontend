import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { RazasComponent } from './razas/razas.component';
import { ObjetosComponent } from './objetos/objetos.component';
import { ClasesComponent } from './clases/clases.component';
import { ConjurosComponent } from './conjuros/conjuros.component';
import { NewUserComponent } from './new-user/new-user.component';
import { MisPersonajesComponent } from './mis-personajes/mis-personajes.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { authGuard } from './guards/auth.guard';
import { noAuthGuard } from './guards/no-auth.guard';
import { HomeComponent } from './home/home.component';
import { CrearConjuroComponent } from './crear-conjuro/crear-conjuro.component';


export const routes: Routes = [
{ path: '', component: HomeComponent },
{ path: 'razas', component: RazasComponent },
{ path: 'crear-conjuro', component: CrearConjuroComponent },
{ path: 'objetos', component: ObjetosComponent },
{ path: 'clases', component: ClasesComponent },
{ path: 'conjuros', component: ConjurosComponent },
{ path: 'login', component: LoginComponent, canActivate: [noAuthGuard] },
{ path: 'new-user', component: NewUserComponent, canActivate: [noAuthGuard] },
{ path: 'mis-personajes', component: MisPersonajesComponent, canActivate: [authGuard]},
{ path: '**', component: NotFoundComponent }
];
