import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { AuthRequest } from '../services/AuthRequest';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  loginError:String = "";
  loginForm =this.formBuilder.group(
    {
      username:["",Validators.required],
      password:["",Validators.required]
    }
  );

  constructor(private formBuilder:FormBuilder, private router:Router, private loginService:AuthService) {
  }
  login(){
    if(this.loginForm.valid){
      this.loginError="";
      this.loginService.login(this.loginForm.value as AuthRequest).subscribe({
        next: (userData: any) => {
          console.log(userData);
        },
        error: (errorData: String) => {
          console.error(errorData);
          this.loginError=errorData;
        },
        complete: () => {
          console.info("Login completo");
          this.router.navigateByUrl('');
          this.loginForm.reset();
        }
      });
    }
  }
}
