import Toolbar from "../component/toolbar/toolbar.js";
import ToolbarAdmin from "../component/toolbar/toolbarAdmin.js";
import toolbarCustumer from "../component/toolbar/toolbarCustumer.js";
export default class PageLogin {
  constructor(args) {
    fetch("./src/page-login.html")
      .then((r) => {
        if (r.status == 200) return r.text();
        else throw new Error(r.status + " " + r.statusText);
      })
      .then((html) => {
        args.target.innerHTML = html;
        console.log("gets loaded");
        this.#init(args);
      })
      .catch((ex) => {
        args.target.innerHTML =
          '<div class="alert alert-danger" role="alert">Fehler: ' +
          ex +
          "</div>";
      });
  } //constructor

  #wechselToolbar(args, rolle) {
    const header = document.querySelector("header");
    header.innerHTML = ""; // Alte Toolbar entfernen
    if (rolle === 3) {
      args.app.toolbar = new ToolbarAdmin({
        args: args.app,
        target: header,
        benutzer: args.app.benutzer,
      });
    } else if (rolle === 0) {
      args.app.toolbar = new ToolbarCustumer({
        args: args.app,
        target: header,
        benutzer: args.app.benutzer,
      });
    } else {
      args.app.toolbar = new Toolbar({
        args: args.app,
        target: header,
        benutzer: args.app.benutzer,
      });

    }
  }

  #init(args) {
    const buttonAnmelden = args.target.querySelector("#buttonAnmelden");
    const textBenutzername = args.target.querySelector("#textBenutzername");
    const textPasswort = args.target.querySelector("#textPasswort");
    const rowMeldung = args.target.querySelector("#rowMeldung");
    const alertMeldung = args.target.querySelector("#alertMeldung");
    const myForm = args.target.querySelector("#myForm");
    console.log(rowMeldung)
    myForm.addEventListener("submit", (e) => {
      e.preventDefault();
      console.log("submit happens");
    });

    buttonAnmelden.addEventListener("click", (e) => {
      let loginData = new FormData();
      loginData.append("benutzername", textBenutzername.value);
      loginData.append("passwort", textPasswort.value);

      args.app.apiLogin(
        (r) => {
          // 1. Argument für successCallback, im Erfolsfall aufgerufen
          if (r.success) {
            console.log("sends request");
            args.app.benutzer = r.options;
            console.log(r.options);
            //alert('Rolle = ' + ' ' + r.options.rolle + ' angemeldet');
            // Store the current toolbar in localStorage
            localStorage.setItem("rolle", r.options.rolle);

            // Toolbar wechseln
            this.#wechselToolbar(args, r.options.rolle);

            // Redirect auf die Homepage nach erfolgreichem Login
            // console.log("happens");
            window.open("#", "_self");
          } else {
            alert("error");
            // Remove the stored toolbar from localStorage
            localStorage.removeItem("rolle");
            rowMeldung.classList.remove("d-none");
            alertMeldung.innerHTML = "<strong>Fehler:</strong> " + r.message;
            setTimeout(() => {
              rowMeldung.classList.add("d-none");
            }, 5000);
          }
        },
        // 2. Argument für errorCallback
        (ex) => {
          console.error(ex);
        },
        // 3. Argument für loginData
        loginData
      );
    });

    
  } //#init
} //class
