# atom
this is a hybris addon, used to optimize front end static resources.
this addon privodes following features:
- support [LESS](http://lesscss.org/), both server side compile and online browser mode.
- support online watch (fantastic for UX dev)
- compress css, js file via gulp
- generate different version of combined file 
- scan and generate quality report for javascript 

##installation

- nodejs is prerequite, you can download it [here](http://www.generalichina.com/)
- dowload this project, then backup project.properties file inside this addon 

- follow hybris addon installation rules to add this to your hybris storefront
- copy back atom specified configuration from your backup project.properties file to new project.properties file which generated by hybris addon install command

>you can also install this addon manully
>-add this addon in localextentions.xml file
>-add this addon in extensioninfo.xml in your storefront
>-change storefront name in atom's project.properties file
- if you have other addon to supply UX related resources, please main these addons in buildcalbacks.xml file:
```code
      <for list="addon1,addon2,addon3" param="letter">
        <sequential>
          <var name="addPath" value="${addPath},@{letter}:${ext.@{letter}.path}">
          </var>
          
        </sequential>
      </for>
 ``` 
replace "addon1,addon2,addon3" to your addon name
- install gulp globally - you can run following command to achieve this:

  ```sh
   $ npm install --global gulp
  ``` 

##how to use

#####1.relace storefront name 
 find variable ${ext.adamstorefront.path} in file buildcallbacks.xml which localted in root folder of prject atom, replace store front name "adamstorefront" to yours. ${ext.**YOURSTOREFRONT**.path}

#####2.add optimize tag
find out javascipt.tag and styleSheet.tag under the right user experience folder (desktop, mobile, responsive) in your storefront. import tld and add optimize tag surround compress tag(javascript.tag and stylesheet.tag).
```html
<%@ taglib prefix="opt" uri="http://com.atom.tag/optimize" %>

	<opt:optimize urlpattern="${encodingAttributes}">
		<compressible:css/>
	</opt:optimize> 

    <opt:optimize urlpattern="${encodingAttributes}">
        <compressible:js/>
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
