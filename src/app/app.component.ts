import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-root',
    imports: [
        FormsModule,
        CommonModule
    ],
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss'
})
export class AppComponent {
    public estrutura: any = {
        "pasta 1": {
            "pasta 2": {
                "audio 1": "id",
                "audio 2": "id"
            },
            "pasta 3": {
                "audio 3": "id",
                "audio 4": "id"
            },
            "audio 5": "id",
            "audio 6": "id",
            "audio 7": "id"
        },
        "audio 8": "id",
        "audio 9": "id",
        "audio 10": "id"
    };
    public explorando: any = this.estrutura;
    public caminho: string = '/';
    public selecao = new Map<string, any>;
    public novaPasta: string = '';
    public criandoNovaPasta: boolean = false;

    criarNovaPasta() {
        console.log('submetido');
        if (!Object.hasOwn(this.explorando, this.novaPasta)) {
            this.explorando[this.novaPasta] = {};
            this.novaPasta = '';
            this.criandoNovaPasta = false;
        }
    }
    novaPastaInvalida() {
        return Object.hasOwn(this.explorando, this.novaPasta);
    }

    alterarCaminho() {
        console.log(this.caminho);
    }

    pegarPastas() {
        return Object.entries(this.explorando).filter(val => typeof val[1] == 'object').map(val => val[0]);
    }
    pegarAqruivos() {
        return Object.entries(this.explorando).filter(val => typeof val[1] == 'string').map(val => val[0]);
    }

    aoClicarItem(nome: string) {
        if (this.selecao.has(nome)) this.selecao.delete(nome);
        else this.selecao.set(nome, this.explorando[nome]);
    }
    selecionarTudo() {
        if (this.selecao.size > 0) this.selecao.clear();
        else this.selecao = new Map(Object.entries(this.explorando));
    }

    apagar() {
        for (let item of this.selecao.entries())
            delete this.explorando[item[0]];
        this.selecao.clear();
    }
}
