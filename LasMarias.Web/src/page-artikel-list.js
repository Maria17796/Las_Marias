export default class PageArtikelList {
    //=========================================================================
    #artikelList = null;
    #dateiList = null;
    #artikel = null;
    //=====================================================================
    constructor(args) {
        fetch('./src/page-artikel-list.html').then((r) => {
            if (r.status == 200) return r.text();
            else throw new Error(r.status + ' ' + r.statusText);
        }).then((html) => {
            args.target.innerHTML = html;
            this.#init(args);
        }).catch((ex) => {
            args.target.innerHTML = '<div class="alert alert-danger" role="alert">Fehler: ' + ex + '</div>';
        });
    }
    //=====================================================================
    #init(args) {
        const textFilter = args.target.querySelector('#textFilter');
        const selectSort = args.target.querySelector('#selectSort');
        const buttonSuche = args.target.querySelector('#buttonSuche');
        const artikelId = args.target.querySelector('#artikelId');
        const tableArtikel = args.target.querySelector('#tableArtikel>tbody');
        const buttonNeu = args.target.querySelector('#buttonNeu');
        const modalArtikel = args.target.querySelector('#modalArtikel');
        const dialogArtikel = new bootstrap.Modal(modalArtikel);
        const textName = args.target.querySelector('#textName');
        const textpreis = args.target.querySelector('#textpreis');
        const textekpreis = args.target.querySelector('#textekpreis');
        const textvkpreis = args.target.querySelector('#textvkpreis');
        const dateAnlage = args.target.querySelector('#dateAnlage');
        const selectKategorie = args.target.querySelector('#selectKategorie');

        const buttonSpeichern = args.target.querySelector('#buttonSpeichern');
        let artikel = null;

        this.#datenLesen(args);

        //---------------
		// bild
		const divBild = args.target.querySelector('#divBild');
		const fileBild = args.target.querySelector('#fileBild');
		const imgBild = args.target.querySelector('#imgBild');
		const collapseBild = args.target.querySelector('#collapseBild');
        //------------------------------------------------------------------------
         
      //---------------------------------------------
		divBild.addEventListener( 'click', () => {
			fileBild.click();
		});

		//---------------------------------------------
		fileBild.addEventListener( 'change', (e) => {
			const fileReader = new FileReader();
			fileReader.onload = (l) => {
				imgBild.src = l.target.result;
				imgBild.classList.remove('d-none');
				divBild.classList.add('d-none');
			};
			fileReader.onerror = (ex) => {
				alert(ex);
			};
			// fileReader.addEventListener( 'load', (l) => {
			// 	imgBild.src = l.target.result;
			// });
			fileReader.readAsDataURL(e.target.files[0]);
			if (!this.#dateiList) this.#dateiList = [];
			for (let i = 0; i < fileBild.files.length; i++){
				this.#dateiList.push(fileBild.files[i]);
			}
			//this.bild = e.target.files[0];
		});

		//---------------------------------------------
		collapseBild.addEventListener( 'dragover', (e) => {
			e.stopPropagation();
			e.preventDefault();
			e.dataTransfer.dropEffect = 'copy';
		});

		//---------------------------------------------
		collapseBild.addEventListener( 'drop', (e) => {
			e.stopPropagation();
			e.preventDefault();

			if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
				let fileReader = new FileReader();
				fileReader.onload = (l) => {
					imgBild.src = l.target.result;
					imgBild.classList.remove('d-none');
					divBild.classList.add('d-none');
				};
				fileReader.onerror = (ex) => {
					alert(ex);
				};
				fileReader.readAsDataURL(e.dataTransfer.files[0]);
				if (!this.#dateiList) this.#dateiList = [];
				for (let i = 0; i < e.dataTransfer.files.length; i++){
					this.#dateiList.push(e.dataTransfer.files[i]);
				}
	
			}
		});
        //-------------------------------------------------------------------------------   
            textekpreis.addEventListener('input', () => {
            textpreis.value = textekpreis.value * textvkpreis.value;});
            textvkpreis.addEventListener('input', () => {
            textpreis.value = textekpreis.value * textvkpreis.value;
        });
        
        //--------------------------------------------------------------------------------

        textFilter.addEventListener('keyup', (e) => {
            if (e.key === 'Enter' || (textFilter.value && textFilter.value.length > 1)) {
                this.#datenLesen(args);
            }
        });

        buttonSuche.addEventListener('click', () => {
            this.#datenLesen(args);
        });

        selectSort.addEventListener('change', () => {
            this.#datenLesen(args);
        });

        tableArtikel.addEventListener('click', (e) => {
            let btn = null;
            if (e.target.nodeName === 'ICONIFY-ICON' && e.target.parentElement.nodeName === 'BUTTON') {
                btn = e.target.parentElement;
            } else if (e.target.nodeName === 'BUTTON') {
                btn = e.target;
            }
            if (btn) {
                if (btn.dataset.aktion === 'del' && btn.dataset.idx) {
                    let artikel = this.#artikelList[parseInt(btn.dataset.idx)];
                    // console.log(artikel);
                    // console.log(this.#artikelList[2]);
                    if (confirm('Wollen Sie *' + artikel.name + '* wirklich löschen?'))
                         {
                        console.log(artikel)
                        args.app.apiDelete((r) => {
                            if (r.success) {
                                this.#datenLesen(args);
                            } else {
                                alert(r.message);
                            }
                        }, (ex) => {
                            alert(ex);
                        }, '/artikel', artikel.artikelId);
                    }
                }
            } else {
                if (e.target.nodeName === 'TD' && e.target.dataset.idx) {
                    //imgBild.src = '';
                    artikel = this.#artikelList[parseInt(e.target.dataset.idx)];
                    this.#artikel = artikel;
                    //console.log('artikelId', artikel.artikelId);
                    textName.value = artikel.name ? artikel.name : '';
                   // textnummer.value = artikel.nummer ? artikel.nummer : '';
                    textpreis.value = artikel.preis ? artikel.preis : '';
                    textekpreis.value = artikel.ekpreis ? artikel.ekpreis : '';
                    textvkpreis.value = artikel.vkpreis ? artikel.vkpreis : '';
                  //  textmwst.value = artikel.mwst ? artikel.mwst : '';
                  //  textbeschreibung.value = artikel.beschreibung ? artikel.beschreibung : '';
                    selectKategorie.value = artikel.kategorie ? artikel.kategorie : '0';
                    dateAnlage.value = artikel.anlageDatum ? artikel.anlageDatum.split('T')[0] : '';

                    console.log('bild abfrage')
                    console.log(this.#artikel.Bild)
                    if (this.#artikel.Bild) {
                        imgBild.src = args.app.apiUrl + '/datei/' + this.#artikel.Bild.dateiId + '/download';
                        imgBild.classList.remove('d-none');
                        divBild.classList.add('d-none');
                    }
                    else{
                        imgBild.src = '';
                        imgBild.classList.add('d-none');
                        divBild.classList.remove('d-none');
                    }

                    dialogArtikel.show();
                }
            }
        });

       buttonNeu.addEventListener('click', () => {
            dialogArtikel.show();
            artikel = {
                id: null
            };

            textName.value = '';
            textpreis.value = '';
            textekpreis.value = '';
            textvkpreis.value = '';
            dateAnlage.value = new Date().toISOString().slice(0, 10);
            textName.classList.remove('is-invalid');
            
         });
   //------------------------------------------------------------------------
    buttonSpeichern.addEventListener('click', () =>  { 
        let ok2save = true;
        textName.classList.remove('is-invalid');
        

        if (!textName.value) {
            ok2save = false;
            textName.classList.add('is-invalid');
       
        }

        if (ok2save) {
            artikel.name = textName.value ? textName.value : null;
            artikel.preis = textpreis.value ? parseFloat(textpreis.value) : null;
            artikel.ekpreis = textekpreis.value ? parseFloat(textekpreis.value) : null;
            artikel.vkpreis = textvkpreis.value ? parseFloat(textvkpreis.value) : null;
            artikel.anlagedatum = dateAnlage.value ? dateAnlage.value : null;
           console.log('artikel', artikel);

            args.app.apiSet((r) => {
                if (r.success) {
                    this.#datenLesen(args);
                    if (this.#dateiList && this.#dateiList.length	 > 0) {
                        args.app.apiArtikelDateiUpload((r2) => {
                            console.log('bild speichern');
                            this.#datenLesen(args);
                            if (r2.success) alert('Erfolgreich gespeichert!');
                        }, (ex) => {
                            alert(ex);
                        }, this.#artikel.artikelId, this.#dateiList);
                    }
                    dialogArtikel.hide();
                } else {
                    alert(r.message);
                }
            }, (ex) => {
                alert(ex);
            }, '/artikel', artikel.artikelId, artikel);
        }
        });
    } 
    #datenLesen(args) {
        const tableArtikel = args.target.querySelector('#tableArtikel>tbody');
        const textFilter = args.target.querySelector('#textFilter');
        const selectSort = args.target.querySelector('#selectSort');
        const infoText = args.target.querySelector('#infoText');
        let idx = 0;

        let pars = {
            sort: selectSort.value
        };

        if (textFilter.value) {
            pars.filter = textFilter.value;
        }

        args.app.apiGetArtikelList((r) => {
            console.log({ r })
            if (r.success) {
                this.#artikelList = r.options;
                let html = '';

                for (let artikel of this.#artikelList) {
                    html +=
                        `<tr>
                            <td>
                                <button class="btn btn-outline-light" data-aktion="del" data-idx="${idx}"><iconify-icon icon="bi:trash3"></iconify-icon></button>
                            </td>
                            <td class="element-clickable" data-idx="${idx}">${artikel.artikelId} </td>
                            <td class="element-clickable" data-idx="${idx}">${artikel.name} </td>
                            <td class="element-clickable" data-idx="${idx}">${artikel.preis ? artikel.preis : ''}</td>
                            <td class="element-clickable" data-idx="${idx}">${artikel.ekpreis ? artikel.ekpreis : ''}</td>
                            <td class="element-clickable" data-idx="${idx}">${artikel.vkpreis ? artikel.vkpreis : ''}</td>
                            <td class="element-clickable" data-idx="${idx}">${artikel.anlageDatum ? args.app.formatDate(artikel.anlageDatum) : ''}</td>
                        </tr>`;
                    idx++;
                }
                tableArtikel.innerHTML = html;

                if (this.#artikelList && this.#artikelList.length > 0) {
                    infoText.innerText = this.#artikelList.length + ' Zeilen gefunden';
                } else {
                    infoText.innerText = 'Keine Daten zum Anzeigen gefunden!';
                }

            } else {
                if (r.code == 401) window.open('#logout', '_self');
            }

        }, (ex) => {
            console.error(ex);
        }, '/artikellist', pars);
    }
}