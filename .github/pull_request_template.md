## Ticket
Link a la tarea de ClickUp (INC-NNNN o US_NNN)
## Causa raíz
Qué estaba mal y dónde (archivo y función)
## Cambio realizado
Qué se modificó y por qué es el cambio mínimo
## Test de regresión
Archivo del test · commit en rojo · commit en verde
## Verificación manual
Pasos ejecutados en local sobre la rama y resultado
## Riesgos y alcance
Qué otras partes del módulo podrían verse afectadas
## Checklist
- [ ] El título y la rama llevan el ID del ticket
- [ ] El alcance se limita al ticket (sin refactors ni cambios de formato ajenos)
- [ ] Hay un test que reproduce el defecto: run en rojo antes del fix y en verde después
- [ ] Los seis pasos del pipeline están en verde
- [ ] La cobertura no baja del umbral (sección 2.8)
- [ ] Se declara si se usó IA y para qué (sección 2.13)
