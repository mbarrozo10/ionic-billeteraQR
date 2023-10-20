import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { Firestore, addDoc, collection, collectionData, doc, getFirestore, onSnapshot, query, updateDoc, where, deleteDoc  } from '@angular/fire/firestore';
import Swal from 'sweetalert2';
import {BarcodeScanner} from '@ionic-native/barcode-scanner/ngx'
import { Observable, Subscription } from 'rxjs';
// import { query } from '@angular/animations';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {
 
  constructor(private authService: AuthService, private router: Router, private firestore : Firestore, private code: BarcodeScanner) {
    const placeref= collection(this.firestore, 'usuarios');
     const retorno= collectionData(placeref);
     retorno.subscribe(data =>
     {
      
      // const retorno= data.find(item => item['correo']===this.authService.retornarUsuario());
      for (const x of data){
        if(x['correo']=== this.authService.retornarUsuario() ){
          this.usuario= x['usuario'];
        }
      }
    
     })
   }
   
   usuario?:  any;
   cod?: any;
   datos?:any = "";
   saldosCargados?: any[]=[];
   ponele?:boolean;
  ngOnInit() {
    const placeref= collection(this.firestore, 'saldoUsuarios');
     collectionData(placeref).subscribe(x => {
      x.forEach(item => {
        if(item['usuario']===this.authService.retornarUsuario()){
          this.datos=item;
        }
      });
     });
     const x= collection(this.firestore, 'saldosCargados');
     
     collectionData(x).subscribe(x => {
      this.saldosCargados=[]
      x.forEach(item => {
          this.saldosCargados?.push(item);
      });
     });
     this.ponele=true;
    

  }
  
  async logout(){
   await this.authService.logout();
   this.router.navigateByUrl('/', {replaceUrl: true});
   this.ponele=false;
  }
  

  ngOnDestroy(){
    if (this.dataAgregar) {
      this.dataAgregar.unsubscribe();
    } 
    if (this.dataBorrar) {
      this.dataBorrar.unsubscribe();
    } }
  test: any;
 

  escanear(){
    this.code.scan().then(code => {
       this.cargarSaldo(code.text)
    })
    }
    dataAgregar?: Subscription | undefined;
    dataBorrar?: Subscription | undefined;
 
  async cargarSaldo(text: string) {
    let valor=0;
    console.log(text)
    if(text=== "8c95def646b6127282ed50454b73240300dccabc"){
      valor=10;
    }else if( text =="ae338e4e0cbb4e4bcffaf9ce5b409feb8edd5172"){ 
      console.log(text+ "entre bien");
      valor=50;
    }
    else if(text === "2786f4877b9091dcad7f35751bfcf5d5ea712b2f") valor=100;
    if(this.ponele)
   { if(!this.verificarSaldos(text) || (this.datos['tipo']=="admin" && this.verificarAdmin(text)))
    {

      const placeref= await collection(this.firestore, "indicesQR");
      this.dataAgregar= collectionData(placeref).subscribe( data =>{
        if(this.ponele)
        {console.log(valor);
        data.forEach((data) =>{
            if(data['id']==this.datos['id']){
              this.idcollection=data['idCollection']
              const db= getFirestore();
              const docref= doc(db,"saldoUsuarios",this.idcollection);
              const dat={
                saldo: this.datos['saldo']+ valor
              }
              updateDoc(docref,dat)
            }
            
        });
        const doe= collection(this.firestore, "saldosCargados");
        const dat={
          usuario: this.authService.retornarUsuario(),
          codigo: text
        }
        addDoc(doe,dat);
        valor=0;
        text="";}
      })
    }else{
        Swal.fire({
          text: "no podes cargar de nuevo",
          heightAuto: false
        })
      }}
  }


  verificarAdmin(text: string): boolean {
    let x:any[]=[]
    this.saldosCargados?.forEach((sald) => {
      if(sald['usuario']== this.authService.retornarUsuario() && sald['codigo']== text) x.push(sald)
    })
    console.log(x)
    console.log("me dejo")

    if(x?.length >= 2){
      console.log("me dejo")
      return false
    }
    return true;
  }


  idcollection:any;
  verificarSaldos(text:string) {
    let x:boolean = false;
      this.saldosCargados?.forEach( saldo => {
        console.log(saldo);
        console
        if(saldo['usuario']===this.authService.retornarUsuario() && text=== saldo['codigo']){
          x=true;
        }
        console.log(x);
      })
    return x;
  }

  borrar(){
    console.log("hols");
    let borrables:any []=[]
    const t= collection(this.firestore, 'saldosCargados');
    let q= query(t,where("usuario", "==",this.authService.retornarUsuario())) ;

    const p= onSnapshot(q, (snapshot)=>{
      snapshot.docs.forEach((x) =>{
       borrables.push(x.id);
      })
      const db= getFirestore();
       borrables.forEach(x => {
         const docref= doc(db,"saldosCargados",x);
         deleteDoc(docref);
       })
       
     })
    
     const placeref=  collection(this.firestore, "indicesQR");
     if(this.ponele)
     {
      this.dataBorrar= collectionData(placeref).subscribe( data =>{
      console.log("borre")
      data.forEach((data) =>{
          if(data['id']==this.datos['id']){
            this.idcollection=data['idCollection']
            const db= getFirestore();
            const docref= doc(db,"saldoUsuarios",this.idcollection);
            const dat={
              saldo: 0
            }
            updateDoc(docref,dat)
            p();
          } });
      })}
    }
    

}
