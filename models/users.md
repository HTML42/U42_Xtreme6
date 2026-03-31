# users model

## purpose

Basis-Tabelle für Accounts/Benutzer.

## table

- name: `users`
- primary key: `id`

## fields

### id

- type: int
- required: yes
- auto increment: yes
- unique: yes

### username

- type: string
- required: yes
- unique: yes
- note: Login-Name des Users.

### password

- type: string
- required: yes
- note: Passwort-Hash (niemals Klartext speichern).

### validate_date

- type: int|null
- required: no
- note: Unix-Timestamp in Sekunden, wann der Account validiert wurde.

### lastlogin_date

- type: int|null
- required: no
- note: Unix-Timestamp in Sekunden vom letzten Login.

### hash

- type: string
- required: yes
- unique: yes
- format: exactly 10 characters, uppercase (`A-Z0-9`)
- note: Eindeutiger externer Identifier, damit nicht zwingend mit IDs gearbeitet werden muss (z. B. Mail-Validierung).

### insert_date

- type: int
- required: yes
- note: Unix-Timestamp in Sekunden (`time()`).

### update_date

- type: int|null
- required: yes
- note: Unix-Timestamp in Sekunden (`time()`), bei Änderungen setzen.

### delete_date

- type: int|null
- required: yes
- note: Unix-Timestamp in Sekunden (`time()`), bei Löschung/Soft-Delete setzen.

## validation

- `username` darf nicht leer sein.
- `password` muss ein Hash sein (kein Klartext).
- `hash` muss exakt 10 Zeichen lang sein und ausschließlich Großbuchstaben/Ziffern enthalten.
