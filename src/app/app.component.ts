import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
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
    @ViewChild('inputCaminho')
    inputCaminho!: ElementRef;
    @ViewChild('inputRenomear')
    inputRenomear!: ElementRef;
    @ViewChild('inputNovaPasta')
    inputNovaPasta!: ElementRef;

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
    public caminho: string = '';
    public caminhoSegmentado: string[] = [];
    public novoCaminho: string = this.caminho;
    public erroNovoCaminho: string = '';
    public selecao = new Map<string, any>;
    public novaPasta: string = '';
    public criandoNovaPasta: boolean = false;
    public alterandoCaminho: boolean = false;
    public renomeando: string = '';
    public novoNome: string = '';

    criarNovaPasta() {
        this.novaPasta = this.novaPasta.trim();
        if (!Object.hasOwn(this.explorando, this.novaPasta)) {
            this.explorando[this.novaPasta] = {};
            this.novaPasta = '';
            this.criandoNovaPasta = false;
        }
    }
    novaPastaInvalida() {
        return Object.hasOwn(this.explorando, this.novaPasta.trim());
    }

    alterarCaminho(novoCaminho?: string) {
        try {
            const {absoluto, conteudo} = this.resolverCaminho(novoCaminho ?? this.novoCaminho);
            this.caminho = absoluto;
            this.novoCaminho = this.caminho;
            this.caminhoSegmentado = absoluto.split('/').filter(val => val);
            this.explorando = conteudo;
            this.selecao.clear();
        }
        catch (e) {
            if (e instanceof CaminhoInvalido) this.erroNovoCaminho = e.message;
            else throw e;
        }
    }
    resolverCaminho(caminho: string): {absoluto: string, conteudo: any} {  
        if (!caminho.startsWith('/'))
            caminho = this.caminho + '/' + caminho;
        let conteudo = this.estrutura;
        let segmentos = caminho.split('/').filter(val => val).map(val => val.trim());
        if (segmentos.length > 0) {
            //resolver ../
            for (let i = 0; i < segmentos.length; i++) {
                if (segmentos[i] == '..') {
                    if (i == 0) {
                        throw new CaminhoInvalido(`".." não existe em "/"`);
                    }
                    segmentos.splice(i - 1, 2);
                    i -= 2;
                }
            }
            //resolver desde raíz
            for (let i = 0; i < segmentos.length; i++) {
                if (conteudo[segmentos[i]]) {
                    conteudo = conteudo[segmentos[i]];
                }
                else {
                    const aux = segmentos.slice(0, i).join('/');
                    throw new CaminhoInvalido(`"${segmentos[i]}" não existe em "${aux ? aux : '/'}"`);
                }
            }
            caminho = '/' + segmentos.join('/');
        }
        return {absoluto: caminho, conteudo};
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
    abrirArquivo(nome: string) {
        console.log(nome);
    }
    abrirPasta(nome: string, apagarSelecao = true) {
        this.explorando = this.explorando[nome];
        this.caminho += `/${nome}`;
        this.caminhoSegmentado.push(nome);
        this.novoCaminho = this.caminho;
        if (apagarSelecao) this.selecao.clear();
    }
    voltarPasta() {
        if (this.caminho) {
            this.alterarCaminho(this.caminho + '/..');
        }
    }

    selecionarTudo() {
        if (this.selecao.size > 0) this.selecao.clear();
        else this.selecao = new Map(Object.entries(this.explorando));
    }

    apagarSelecao() {
        for (let item of this.selecao.entries())
            delete this.explorando[item[0]];
        this.selecao.clear();
    }

    moverPara(caminhoDestino: string) {
        const caminhoDestinoAbsoluto = this.resolverCaminho(caminhoDestino).absoluto;
        if (caminhoDestinoAbsoluto == this.caminho) return;
        const segmentosDestinoAbsoluto = caminhoDestinoAbsoluto.split('/').filter(val => val);
        const selecao = this.selecao;
        function mergirCampos(destino: any): any {
            let mescla = destino;
            for (let entry of selecao.entries()) {
                if (!Object.hasOwn(destino, entry[0]) 
                    || confirm(`"${entry[0]}" já existe em "${caminhoDestinoAbsoluto}". Deseja sobrescrevê-lo(a)?`)
                ) {
                    mescla = {
                        ...mescla,
                        ...Object.fromEntries([entry])
                    }
                }
            }
            return mescla;
        }
        if (segmentosDestinoAbsoluto.length >= 1) {
            const pastaAnterior = this.resolverCaminho(caminhoDestinoAbsoluto + '/..').conteudo;
            const nomePasta = segmentosDestinoAbsoluto.at(-1) as string;

            pastaAnterior[nomePasta] = mergirCampos(pastaAnterior[nomePasta]);
        }
        else {
            this.estrutura = mergirCampos(this.estrutura);
        }
        this.apagarSelecao();
    }

    iniciarArrasto(item: string) {
        if (this.selecao.size == 0) {
            this.selecao.set(item, this.explorando[item]);
        }
    }

    imprimirEstrutura() {
        return JSON.stringify(this.estrutura, null, 4);
    }
    imprimirCaminho() {
        return JSON.stringify(this.caminhoSegmentado, null, 4);
    }

    iniciarRenomeacao() {
        let item;
        for (item of this.selecao.entries()) break;
        if (item) {
            this.renomeando = this.novoNome = item[0];
            setTimeout(() => this.inputRenomear.nativeElement.focus(), 10);
        }
    }
    renomear() {
        let item;
        for (item of this.selecao.entries()) break;
        if (item) {
            this.explorando[this.novoNome] = item[1];
            delete this.explorando[item[0]];
            this.renomeando = '';
            this.selecao.clear();
            this.selecao.set(this.novoNome, item[1]);
        }
    }

    aoClicarCaminho() {
        this.alterandoCaminho = true; 
        setTimeout(() => this.inputCaminho.nativeElement.focus(), 10);
    }

    iniciarCriarNovaPasta() {
        this.criandoNovaPasta = true;
        setTimeout(() => this.inputNovaPasta.nativeElement.focus(), 10);
    }
}

class CaminhoInvalido extends Error {
    constructor(msg: string) {
        super(msg);
    }
}