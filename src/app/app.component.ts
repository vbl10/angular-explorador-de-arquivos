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
    public estrutura: Tree = treeFromObject({
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
    });

    public explorando: Tree = this.estrutura;
    public caminho: string = '/';
    public selecao = new Map<string, undefined>;
    public novaPasta: string = '';
    public criandoNovaPasta: boolean = false;

    constructor() {
        console.log(this.estrutura);
    }

    criarNovaPasta() {
        console.log('submetido');
        if (!this.explorando.has(this.novaPasta)) {
            this.explorando.set(this.novaPasta, treeFromObject({}));
            this.novaPasta = '';
            this.criandoNovaPasta = false;
        }
    }
    novaPastaInvalida() {
        return this.explorando.has(this.novaPasta);
    }

    alterarCaminho() {
        console.log(this.caminho);
    }

    pegarPastas() {
        const pastas: string[] = [];
        for (let item of this.explorando.entries())
            if (typeof item[1] == 'object')
                pastas.push(item[0]);
        return pastas;
    }
    pegarAqruivos() {
        const arquivos: string[] = [];
        for (let item of this.explorando.entries())
            if (typeof item[1] == 'string')
                arquivos.push(item[0]);
        return arquivos;
    }

    aoClicarItem(nome: string) {
        if (this.selecao.has(nome)) this.selecao.delete(nome);
        else this.selecao.set(nome, undefined);
    }
    selecionarTudo() {
        if (this.selecao.size > 0) this.selecao.clear();
        else for (let item of this.explorando) this.selecao.set(item[0], undefined);
    }

    apagar() {
        for (let item of this.selecao.entries())
            this.explorando.delete(item[0]);
        this.selecao.clear();
        console.log(this.estrutura);
    }
}

type Tree = Map<string, string | Tree>;
function treeFromObject(obj: any): Tree {
    const tree: Tree = new Map<string, string | Tree>();
    Object.entries(obj).forEach(val => {
        if (typeof val[1] == 'string') {
            tree.set(val[0], val[1]);
        }
        else {
            tree.set(val[0], treeFromObject(val[1]));
        }
    })
    return tree;
}