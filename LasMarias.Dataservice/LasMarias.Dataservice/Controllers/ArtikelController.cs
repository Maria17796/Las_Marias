﻿using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Npgsql;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;

namespace LasMarias.Dataservice.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ArtikelController : ControllerBase
    {
        private readonly IConfiguration _configuration;
        private readonly NpgsqlConnection _connection;

        public ArtikelController(IConfiguration configuration)
        {
            _configuration = configuration;
            string connectionString = _configuration.GetValue<string>("ConnectionString");
            _connection = new NpgsqlConnection(connectionString);
        }

        [HttpGet("artikellist")]
        public IActionResult GetList(int? sort, string filter)
        {
            try
            {
                var artikels = Artikel.GetList(_connection);
                //Regex bild = new("^image\\/(png|jpeg|gif|tiff)$", RegexOptions.IgnoreCase);
                foreach(var artikel in artikels)
                {
                    List<Datei> dateiList = Datei.GetList(this._connection, artikel);
                    artikel.Bild = dateiList.FirstOrDefault();
                    //artikel.Bild = dateiList.FirstOrDefault(d => bild.IsMatch(d.Erweiterung));
                }
                return Ok(new StandardResult(true, "ok", artikels));   
            }
            catch (Exception ex)
            {
                return StatusCode(500, new StandardResult(false, ex.Message));
            }
        }

        [HttpGet("{id}")]
        public IActionResult Get(int id)
        {
            try
            {
                var benutzer = Person.Get(_connection, this);
                if (benutzer == null) return Unauthorized();

                var dbArtikel = Artikel.Get(_connection, id);
                if (dbArtikel == null) return NotFound();

                var dateiList = Datei.GetList(_connection, dbArtikel);
                return Ok(dbArtikel);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new StandardResult(false, ex.Message));
            }
        }

        [HttpGet("{id}/datei")]
        public IActionResult GetDateiList(int id)
        {
            try
            {
                var benutzer = Person.Get(_connection, this);
                if (benutzer == null) return Unauthorized();

                var dbArtikel = Artikel.Get(_connection, id);
                if (dbArtikel == null) return NotFound();

                var dateiList = Datei.GetList(_connection, dbArtikel);
                return Ok(dateiList);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new StandardResult(false, ex.Message));
            }
        }

        [HttpPost]
        public IActionResult Insert([FromBody] Artikel artikel)
        {
            try
            {
                var benutzer = Person.Get(_connection, this);
                if (benutzer == null) return Unauthorized();

                if (artikel.Save(_connection) == 1)
                    return Ok(new StandardResult(true, "ok", artikel));
                else
                    return Ok(new StandardResult(false, "Daten nicht gespeichert!"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, new StandardResult(false, ex.Message));
            }
        }

        [HttpPut("{id}")]
        public IActionResult Update(int id, [FromBody] Artikel artikel)
        {
            try
            {
                var benutzer = Person.Get(_connection, this);
                if (benutzer == null) return Unauthorized();

                var dbArtikel = Artikel.Get(_connection, id);
                if (dbArtikel == null) return NotFound();

                if (artikel.Save(_connection) == 1)
                    return Ok(new StandardResult(true, "ok", artikel));
                else
                    return Ok(new StandardResult(false, "Daten nicht gespeichert!"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, new StandardResult(false, ex.Message));
            }
        }

        [HttpPost("{id}/datei")]
        [RequestFormLimits(MultipartBodyLengthLimit = 104857600)]
        public IActionResult DateiSpeichern(int id)
        {
            try
            {
                var benutzer = Person.Get(_connection, this);
                if (benutzer == null) return Unauthorized();

                var dbArtikel = Artikel.Get(_connection, id);
                if (dbArtikel == null) return NotFound();

                var cnt = 0;
                foreach (var file in Request.Form.Files)
                {
                    using var reader = new BinaryReader(file.OpenReadStream());
                    var buffer = reader.ReadBytes((int)file.Length);

                    var datei = new Datei
                    {
                        ArtikelId = dbArtikel.ArtikelId,
                        Inhalt = buffer,
                        MedienTyp = file.ContentType,
                        Name = file.FileName,
                        Erweiterung = file.FileName[file.FileName.LastIndexOf('.')..]
                    };
                    cnt += datei.Save(_connection);
                }

                if (cnt == Request.Form.Files.Count)
                    return Ok(new StandardResult(true, "ok"));
                else
                    return Ok(new StandardResult(false, "nicht alle Dateien gespeichert!"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, new StandardResult(false, ex.Message));
            }
        }
        [HttpDelete("{artikelId}")]
        public IActionResult Delete(int artikelId)
        {
            IActionResult result = null;
            try
            {  
             
                Person benutzer = Person.Get(this._connection, this);
                if (benutzer == null) result = Unauthorized();
                else if (benutzer != null && benutzer.Rolle < PersonRolle.Admin) result = StatusCode(418);
                else
                {
                    Artikel dbArtikel = Artikel.Get(this._connection, artikelId);
                    if (dbArtikel == null) result = NotFound();
                    else
                    {
                        if (dbArtikel.Delete(this._connection) == 1) result = Ok(new StandardResult(true, "ok"));
                        else result = Ok(new StandardResult(false, "Daten wurden nicht gelöscht!"));
                    }
                }
            }
            catch (Exception ex)
            {
#if DEBUG
                result = StatusCode(500, new StandardResult(false, ex.Message));
#else
			   result = StatusCode(500, new StandardResult(false, "Interner Fehler!"));	
#endif
            }
            return result;
        }
    }
}
