import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from "@angular/router";
import { Observable } from "rxjs";
import { AutenticacaoService } from "./autenticacao.service";

@Injectable({
    providedIn: 'root'
})

export class AutenticacaoGuard implements CanActivate{
    constructor(
        private servicoAutenticacao: AutenticacaoService,
        private router: Router
    ){}

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree {
        // console.log("entrou no canActivate")
        if (this.servicoAutenticacao.estaLogado()){
            return true;
        }
        alert("Efetue o Login")
        return this.router.parseUrl('login');
    }
    
}