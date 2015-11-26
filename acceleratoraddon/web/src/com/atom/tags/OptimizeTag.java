/**
 * 
 */
package com.atom.tags;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.jsp.JspTagException;
import javax.servlet.jsp.tagext.BodyContent;
import javax.servlet.jsp.tagext.BodyTagSupport;

import com.atom.constants.AtomConstants;
import com.atom.tag.AbstractTagHandler;
import com.granule.CompressorSettings;
import com.granule.parser.Element;
import com.granule.parser.TagReader;
import com.sap.adam.storefront.tags.AcceleratorCompressTag;
import com.sap.adam.storefront.web.wrappers.RemoveEncodingHttpServletRequestWrapper;


/**
 * @author i054410
 * 
 */
public class OptimizeTag extends AcceleratorCompressTag
{
	@Override
	public int doAfterBody() throws JspTagException{
		
		final HttpServletRequest httpRequest = (HttpServletRequest) pageContext.getRequest();
		final BodyContent bodyContent = getBodyContent();
		final String oldBody = bodyContent.getString();
		bodyContent.clear();
			
		String atomMode = httpRequest.getParameter(AtomConstants.ATOM_MODE);
		String sLessEnable = httpRequest.getParameter(AtomConstants.LESS_ENABLE);
		String sCompressEnable = httpRequest.getParameter(AtomConstants.COMPRESS_ENABLE);
		
		boolean lessEnable = getBooleanValue(sLessEnable);
		boolean compressEnable = getBooleanValue(sCompressEnable);
		boolean granuleEnable = CompressorSettings.getBoolean(httpRequest.getParameter("granule"), false);
		
		AbstractTagHandler handler = AbstractTagHandler.buildHandlerChain(httpRequest);
		String newBody = handler.process(oldBody, null);
			
			try
			{	
				getPreviousOut().print(newBody);
			}
			catch (final IOException e)
			{
				throw new JspTagException(e);
			}
		}
		return SKIP_BODY;
	}
	
	
	private boolean getBooleanValue(String value){
		
		if(value == null)return false;
		return Boolean.valueOf(value).booleanValue();
	}
	
	 List<Element> getTagsFromString(String body,String tagName){
		  TagReader source = new TagReader(body);
       return source.getAllElements(tagName);
	}
}
