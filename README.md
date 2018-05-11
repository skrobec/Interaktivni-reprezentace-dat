# Interaktivni-reprezentace-dat
## Popis ke spuštění aplikace

* Ke zprovoznění aplikace bez webového hostingu na lokálním softwarovém serveru je použito řešení [Apache](https://www.apachehaus.com/cgi-bin/download.plx).
* Dále je využito řešení Apache Tomcat jako Java Servlet Container pro Framework RDF4J. Ke stáhnutí postačí poslední stabilní verze. [Odkaz na stránky](http://tomcat.apache.org/).
*  Z frameworku RDF4J je pak potřeba umístit war soubory server a workbench do containeru Tomcat. [Odkaz ke stáhnutí](http://rdf4j.org/download/).
*  V souboru web.xml u RDF4J serveru je po úspěšném umístění třeba odkomentovat část pro povolení cross-origin requests, aby se předešlo chybám 
s tím spojenými. 
* Před spuštěním aplikace je nutné nahrát data na databázový server. Přes webové GUI RDF4J workbench nejdříve vytvoříme nový repositář. 
Poté přidáme RDF data v sekci add. Testovací data jsou ve složce test_data a lze je importovat i bez rozbalení. 
* Posledním krokem před spuštěním je úprava souboru config.js ve složce js. Je třeba upravit druhý parametr při vytváření TA Clienta dle toho, 
jaké id repositáře bylo zvoleno. 
* Po předchozích fázích pouze stačí spustit client_app.html v prohlížeči přes localhost. 