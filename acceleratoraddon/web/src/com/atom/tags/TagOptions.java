/**
 * 
 */
package com.atom.tags;

import javax.servlet.http.HttpServletRequest;

/**
 * @author i054410
 *
 */
public class TagOptions
{
	private   String method = null;
	private   String ID = null;
	private   String options = null;
	private   String basePath = null;
	private String urlpattern = null;
	private HttpServletRequest httpRequest = null;
	private String jsDestPath = null;
	private String cssDestPath = null;
	private boolean onlineLess = false;
	private boolean baseResource = false;
	/**
	 * @return the method
	 */
	public String getMethod()
	{
		return method;
	}
	/**
	 * @param method the method to set
	 */
	public void setMethod(String method)
	{
		this.method = method;
	}
	/**
	 * @return the iD
	 */
	public String getID()
	{
		return ID;
	}
	/**
	 * @param iD the iD to set
	 */
	public void setID(String iD)
	{
		ID = iD;
	}
	/**
	 * @return the options
	 */
	public String getOptions()
	{
		return options;
	}
	/**
	 * @param options the options to set
	 */
	public void setOptions(String options)
	{
		this.options = options;
	}
	/**
	 * @return the basePath
	 */
	public String getBasePath()
	{
		return basePath;
	}
	/**
	 * @param basePath the basePath to set
	 */
	public void setBasePath(String basePath)
	{
		this.basePath = basePath;
	}
	/**
	 * @return the urlpattern
	 */
	public String getUrlpattern()
	{
		return urlpattern;
	}
	/**
	 * @param urlpattern the urlpattern to set
	 */
	public void setUrlpattern(String urlpattern)
	{
		this.urlpattern = urlpattern;
	}
	/**
	 * @return the httpRequest
	 */
	public HttpServletRequest getHttpRequest()
	{
		return httpRequest;
	}
	/**
	 * @param httpRequest the httpRequest to set
	 */
	public void setHttpRequest(HttpServletRequest httpRequest)
	{
		this.httpRequest = httpRequest;
	}

	public String getJsDestPath(){
		return this.jsDestPath;
	}
	
	public void setJsDestPath(String jsDestPath){
		this.jsDestPath = jsDestPath;
	}
	
	public String getCssDestPath(){
		return this.cssDestPath;
	}
	
	public void setCssDestPath(String cssDestPath){
		this.cssDestPath = cssDestPath;
	}
	
	public void setOnlineLess(boolean online){
		this.onlineLess = online;
	}
	
	public boolean isOnlineLess(){
		return this.onlineLess;
	}
	
	public void setBaseResource(boolean baseResource){
		this.baseResource = baseResource;
	}
	
	public boolean isBaseResource(){
		return this.baseResource;
	}
}
