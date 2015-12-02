/**
 * 
 */
package com.atom.tags;


import java.util.List;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;
import javax.servlet.jsp.JspTagException;

import com.granule.parser.TagReader;
import com.granule.parser.Element;
import com.atom.constants.AtomConstants;
import com.granule.CompressorSettings;

/**
 * @author i054410
 * 
 */
public abstract class AbstractTagHandler
{
	public abstract String process(String body, List<Element> els) throws Exception;
	
	protected TagOptions tp;
	protected AbstractTagHandler next;
	
	public void setnext(AbstractTagHandler next)
	{
		if(this.next != null){
			this.next.setnext(next);
		}else{
			this.next = next;
		}
	}
	
	public boolean hasNext()
	{
		return this.next != null; 
	}
	
	public AbstractTagHandler next()
	{
		return next;
	}

	public static AbstractTagHandler buildHandlerChain(TagOptions tp) throws JspTagException
	{	
		HttpServletRequest httpRequest = tp.getHttpRequest();
		HttpSession session = httpRequest.getSession();
		 
		final String atomMode = (String)session.getAttribute(AtomConstants.ATOM_MODE);
		final boolean lessEnable = getBooleanValue(session.getAttribute(AtomConstants.LESS_ENABLE));
		final boolean compressEnable = getBooleanValue(session.getAttribute(AtomConstants.COMPRESS_ENABLE));
		final boolean granuleEnable = CompressorSettings.getBoolean(httpRequest.getParameter("granule"), false);
		tp.setJsDestPath(httpRequest.getContextPath() + session.getAttribute(AtomConstants.COMPRESS_JS_PATH).toString());
		tp.setCssDestPath(httpRequest.getContextPath() + session.getAttribute(AtomConstants.COMPRESS_CSS_PATH).toString());
		
		AbstractTagHandler handler = null;
		if (granuleEnable && compressEnable)
		{
			throw new JspTagException("granule and atom comtpress can not be enabled together");
		}

		if(lessEnable){
			if(atomMode.indexOf("pro") >= 0 || granuleEnable || compressEnable){
				handler = new LessHandler(tp);
			}
		}
		
		if(granuleEnable){
			if(handler == null){
				handler = new GranuleCompressHandler(tp);
			}else{
				handler.setnext(new GranuleCompressHandler(tp));
			}
		}else if(compressEnable){
			if(handler == null){
				handler = new AtomCompressHandler(tp);
			}else{
				handler.setnext(new AtomCompressHandler(tp));
			}
		}
		return handler==null? new NothingHandler(tp): handler;
	}
	
	 List<Element> getTagsFromString(String body,String tagName){
		  TagReader source = new TagReader(body);
      return source.getAllElements(tagName);
	}

	protected static boolean getBooleanValue(Object value)
	{
		if (value == null)
		{
			return false;
		}
		if(value.getClass().getSimpleName().equalsIgnoreCase("Boolean")){
			return ((Boolean)value).booleanValue();
		}
		return false;
	}
}
