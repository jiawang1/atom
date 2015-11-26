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
import com.atom.tag.TagOptions;
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
	private static final String METHOD = null;
	private static final String ID = null;
	private static final String OPTIONS = null;
	private static final String BASEPATH = null;
	private String urlpattern = null;
	
	@Override
	public int doAfterBody() throws JspTagException{
		//TODO handle base URL
		final HttpServletRequest httpRequest = (HttpServletRequest) pageContext.getRequest();
		final BodyContent bodyContent = getBodyContent();
		final String oldBody = bodyContent.getString();
		bodyContent.clear();
		
		TagOptions tp = new TagOptions();
		tp.setBasePath(BASEPATH);
		tp.setGenerateName("combind_12345678.min");
		tp.setHttpRequest(httpRequest);
		tp.setID(ID);
		tp.setMethod(METHOD);
		tp.setOptions(OPTIONS);
		tp.setUrlpattern(urlpattern);
		AbstractTagHandler handler = AbstractTagHandler.buildHandlerChain(tp);
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
}
