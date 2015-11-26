/**
 * 
 */
package com.atom.tag;

import TagReader;

import java.util.List;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.jsp.JspTagException;
import com.granule.parser.TagReader;
import com.granule.parser.Element;
import com.atom.constants.AtomConstants;


/**
 * @author i054410
 * 
 */
public abstract class AbstractTagHandler
{
	public abstract String process(String body, List<Element> els);
	
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

	public static AbstractTagHandler buildHandlerChain(final HttpServletRequest httpRequest) throws JspTagException
	{
		final String atomMode = httpRequest.getParameter(AtomConstants.ATOM_MODE);
		final boolean lessEnable = getBooleanValue(httpRequest.getParameter(AtomConstants.LESS_ENABLE));
		final boolean compressEnable = getBooleanValue(httpRequest.getParameter(AtomConstants.COMPRESS_ENABLE));
		final boolean granuleEnable = CompressorSettings.getBoolean(httpRequest.getParameter("granule"), false);
		AbstractTagHandler handler = null;
		if (granuleEnable && compressEnable)
		{
			throw new JspTagException("granule and atom comtpress can not be enabled together");
		}

		if(lessEnable){
			if(atomMode.indexOf("pro") >= 0 || granuleEnable || compressEnable){
				handler = new LessHandler();
			}
		}
		
		if(granuleEnable){
			if(handler == null){
				handler = new GranuleCompressHandler();
			}else{
				handler.setnext(new GranuleCompressHandler());
			}
		}else if(compressEnable){
			if(handler == null){
				handler = new AtomCompressHandler();
			}else{
				handler.setnext(new AtomCompressHandler());
			}
		}
		return handler==null? new NothingHandler(): handler;

	}
	
	 List<Element> getTagsFromString(String body,String tagName){
		  TagReader source = new TagReader(body);
      return source.getAllElements(tagName);
	}

	protected static boolean getBooleanValue(final String value)
	{
		if (value == null)
		{
			return false;
		}
		return Boolean.valueOf(value).booleanValue();
	}
}
