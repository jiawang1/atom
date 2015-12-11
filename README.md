# atom
this is a hybris addon, used to optimize front end static resources.
this addon privodes following features:
- support [LESS](http://lesscss.org/), both server side compile and online browser mode.
- support online watch (fantastic for UX dev)
- compress css, js file via gulp
- generate different version of combined file 

##installation

- dowload this project and follow hybris addon installation rules to add this to your hybris storefront. 
- nodejs is prerequite, you can download it [here](http://www.generalichina.com/)
- install gulp globally - you can run following command to achieve this:

  ```sh
   $ npm install --global gulp
  ``` 

##how to use

#####1.relace storefront name 
 find variable ${ext.adamstorefront.path} in file buildcallbacks.xml which localted in root folder of prject atom, replace store front name "adamstorefront" to yours. ${ext.**YOURSTOREFRONT**.path}

#####2.add optimize tag
find out javascipt.tag and styleSheet.tag under the right user experience folder (desktop, mobile, responsive) in your storefront. import tid and add optimize tag surround compress tag.
```html
<%@ taglib prefix="opt" uri="http://com.atom.tag/optimize" %>
	<opt:optimize urlpattern="${encodingAttributes}">
		<compressible:css/>
	</opt:optimize> 
```	
#####3.download dependency 
go into folder ${atom}/acceleratoraddon/web/webroot/_ui/share, run command:
```sh  
  $npm install
``` 
then everything ready.

## attention
- all CSS rules should have clear priority. all CSS/LESS files loaded disordered.
