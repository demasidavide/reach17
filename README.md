# 📚 API Gestione Corsi Universitari

API RESTful per la gestione di corsi universitari, tipologie di corso e atenei, sviluppate con Node.js ed Express.

## Descrizione del Progetto

Questo progetto implementa un sistema backend completo per la gestione di corsi universitari attraverso API REST. Consente di creare, modificare, eliminare e visualizzare corsi, tipologie di corsi e atenei, oltre a gestire le relazioni molti-a-molti tra corsi e atenei.

## Tecnologie Utilizzate

- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web per Node.js
- **MySQL** - Database relazionale
- **mysql2** - Driver MySQL per Node.js
- **Winston** - Libreria dui logging per Node.js
- **JWT** - Per autenticazione e sicurezza

## 📋 Funzionalità

### Tipologie di Corso
- ✅ Creazione di nuove tipologie
- ✅ Modifica tipologie esistenti
- ✅ Eliminazione tipologie
- ✅ Visualizzazione di tutte le tipologie con gestione paginazione
- ✅ Ricerca di tipologie in base ad un ID specifico

### Corsi
- ✅ Creazione di nuovi corsi con tipologia associata con transazione
- ✅ Modifica informazioni corso
- ✅ Eliminazione corsi
- ✅ Visualizzazione di tutti i corsi con gestione paginazione
- ✅ Filtro per nome del corso con gestione paginazione
- ✅ Filtro per tipologia del corso con gestione paginazione
- ✅ Ricerca di corsi in base ad un ID specifico


### Atenei
- ✅ Creazione di nuovi atenei
- ✅ Modifica informazioni ateneo
- ✅ Eliminazione atenei
- ✅ Visualizzazione di tutti gli atenei con gestione paginazione
- ✅ Ricerca di atenei in base ad un ID specifico


### Associazioni Corso-Ateneo
- ✅ Associazione di un corso a uno o più atenei
- ✅ Rimozione associazioni
- ✅ Filtro per nome corso con gestione paginazione
- ✅ Filtro per nome ateneo con gestione paginazione
- ✅ Visualizzazione corsi con relativi atenei con gestione paginazione

## 🗄️ Struttura Database

Il database è composto da 4 tabelle principali:

```sql
- tipologia_corso (id, name)
- corso (id, name, tipologia_id)
- ateneo (id, name)
- corso_ateneo (corso_id, ateneo_id)
```

## ⚙️ Installazione

### Prerequisiti
- Node.js (v14 o superiore)
- MySQL (v5.7 o superiore)
- npm o yarn

### Passaggi

1. **Clona il repository**
```bash
git clone <url-repository>
cd <nome-cartella>
```

2. **Installa le dipendenze**
```bash
npm install
```

3. **Configura il database**

Crea un file `.env` nella root del progetto:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tua_password
DB_NAME=corsi_db
PORT=verifica_porta
```

4. **Crea il database**
```bash
mysql -u root -p < migrations.sql
```

5. **Avvia il server**
```bash
npm start
```

Il server sarà disponibile su `http://localhost:3000`

## 📡 API Endpoints

### Tipologie di Corso

| Metodo | Endpoint | Descrizione | Status Code |
|--------|----------|-------------|-------------|
| GET | `/tipologie/` | Ottieni tutte le tipologie | 500 Errore database |
| GET | `/tipologie/:id` | Ottieni tipologia con id specifico | 200 OK, 400 Id non valido, 404 Non trovato, 500 Errore database |
| POST | `/tipologie/` | Crea una nuova tipologia | 201 Created, 400 Nome non valido, 409 Nome gia presente, 500 Errore database |
| PUT | `/tipologie/:id` | Aggiorna una tipologia | 400 Id non valido, 404 Not Found, 500 Errore database |
| DELETE | `/tipologie/:id` | Elimina una tipologia | 400 Id non valido, 404 Not Found, 500 Errore database |

### Corsi

| Metodo | Endpoint | Descrizione | Status Code |
|--------|----------|-------------|-------------|
| GET | `/corsi/` | Ottieni tutti i corsi e tipologia associata | 500 Errore database |
| GET | `/corsi/:id` | Ottieni un corso specifico | 200 OK, 400 Id non valido, 404 Non trovato, 500 Errore database |
| POST | `/corsi/` | Crea un nuovo corso | 201 Created, 400 Id o nome non valido, 404 Tipologia non trovata, 409 Corso e tipologia gia presenti, 500 Errore database |
| PUT | `/corsi/:id` | Aggiorna un corso | 400 Id non valido, 404 Tipologia non trovata, 500 Errore database |
| DELETE | `/corsi/:id` | Elimina un corso | 400 Id non valido, 404 Id non trovato, 500 Errore database |

### Atenei

| Metodo | Endpoint | Descrizione | Status Code |
|--------|----------|-------------|-------------|
| GET | `/atenei/` | Ottieni tutti gli atenei | 500 Errore database |
| GET | `/atenei/:id` | Ottieni un ateneo specifico | 200 OK, 400 Id non valido, 404 Non trovato, 500 Errore database |
| POST | `/atenei/` | Crea un nuovo ateneo | 201 Created, 400 Id o nome non valido, 404 Tipologia non trovata, 409 Corso e tipologia gia presenti, 500 Errore database |
| PUT | `/atenei/:id` | Aggiorna un ateneo | 400 Id non valido, 404 Tipologia non trovata, 500 Errore database |
| DELETE | `/atenei/:id` | Elimina un ateneo | 400 Id non valido, 404 Id non trovato, 500 Errore database |

### Associazioni Corso-Ateneo

| Metodo | Endpoint | Descrizione | Status Code |
|--------|----------|-------------|-------------|
| POST | `/corso-ateneo/` | Associa un corso a un ateneo | 201 Created, 400 Id corso o id ateneo non valido, 404 Id corso o id ateneo non trovato, 500 Errore database |
| DELETE | `/corso-ateneo/:corsoId/:ateneoId` | Rimuovi associazione | 400 Id corso o id ateneo non valido, 404 Id corso o id ateneo non trovato, 500 Errore database |
| GET | `/corso-ateneo/` | Ottieni tutti i corsi con i loro atenei | 500 Errore database |
| GET | `/corso-ateneo/search/name` | Ricerca per nome corso | 400 Nome non valido, 500 Errore database |
| GET | `/corso-ateneo/search/type` | Ricerca per tipologia corso | 400 Nome non valido, 500 Errore database |

## 📝 Esempi di Utilizzo

### Creare una tipologia di corso
```bash
curl -X POST http://localhost:3000/api/course-types \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJ...." \
  -d '{"nome": "Nome tipologia"}'
```

### Creare un corso
```bash
curl -X POST http://localhost:3000/corsi/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJ...." \
  -d '{"nome":"Nome corso","id":2}'
```

### Associare un corso a un ateneo
```bash
curl -X POST http://localhost:3000/api/courses/1/universities/2 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJ...." \
  -d '{"idCorso":2, "idAteneo":8}'
```

**Risposta esempio:**
```json
{
	"data": [
		{
			"id_corso": 6,
			"nome_corso": "Corso Elettrotecnico",
			"id_tipologia": 12,
			"nome_tipologia": "Corso di Specializzazione"
		},
		{
			"id_corso": 10,
			"nome_corso": "Corso Elettrotecnico",
			"id_tipologia": 13,
			"nome_tipologia": "Corso di Perfezionamento"
		}
        ],
	"pagination": {
		"page": 1,
		"limit": 20,
		"total": 8,
		"totalPages": 1,
		"hasNextPage": false,
		"hasPrevPage": false
	}
}
```

### Filtrare corsi per tipologia
```bash
curl "http://localhost:3000/corso-ateneo/search/type?tipo=Laurea&page=1&limit=15"
```
### Filtrare corsi per Nome
```bash
curl "http://localhost:3000/corso-ateneo/search/name?nome=informatica&page=1&limit=15"
```

## 🏗️ Struttura del Progetto

```
project-root/
│
├── logs/
│   ├── combined.log
│   └── error.log
├── middleware/
│       └── auth.js
├── routes/
│   ├── ateneo.js
│   ├── auth.js
│   ├── corso.js
│   ├── corsoAteneo.js
│   └── tipologia.js
│   
├── .env
├── .gitignore
├── db.js
├── index.js
├── logger.js
├── migrations.sql
├── package-lock.json
├── package.json
└── README.md
```

## 🔒 Best Practices Implementate

- ✅ Architettura REST con naming corretto delle risorse
- ✅ Utilizzo appropriato dei metodi HTTP (GET, POST, PUT, DELETE)
- ✅ Status code HTTP corretti (200, 201, 204, 404, 400, 500)
- ✅ Gestione degli errori centralizzata
- ✅ Validazione dei dati in input
- ✅ Prepared statements per prevenire SQL injection
- ✅ Struttura modulare del codice (MVC pattern)
- ✅ Configurazione tramite variabili d'ambiente

## 🧪 Testing
### <strong><u>🔐 Eseguire per ricevere token come admin</u></strong>
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"user": "admin", "password": "admin123"}'
```


Puoi testare le API utilizzando:
- **cURL** - Vedi esempi sopra
- **Thunder Client** (estensione VS Code)
- **Postman** 
- **Insomnia**

## 📄 Licenza

Questo progetto è stato sviluppato a scopo didattico.

## 👤 Autore

**Davide De Masi**
<div align="left">
  <a href="https://www.instagram.com/demo46/" target="_blank"><img src="https://img.shields.io/static/v1?message=Instagram&logo=instagram&label=&color=E4405F&logoColor=white&labelColor=&style=for-the-badge" height="35" alt="instagram logo"  /></a>
  <a href="https://www.linkedin.com/feed/?trk=sem-ga_campid.20677489327_asid.153452322614_crid.677545198980_kw.linkedin_d.c_tid.kwd-148086543_n.g_mt.e_geo.9053436" target="_blank"><img src="https://img.shields.io/static/v1?message=LinkedIn&logo=linkedin&label=&color=0077B5&logoColor=white&labelColor=&style=for-the-badge" height="35" alt="linkedin logo" /></a>
  <a href="https://www.facebook.com/davide.demasi.7" target="_blank"><img src="https://img.shields.io/static/v1?message=Facebook&logo=facebook&label=&color=1877F2&logoColor=white&labelColor=&style=for-the-badge" height="35" alt="facebook logo"  /></a>
</div>
## 🙏 Note

Progetto realizzato come esercitazione a scopo didattico.

---

Per qualsiasi domanda o suggerimento, non esitare a contattarmi!