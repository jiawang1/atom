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
import com.atom.tags.AbstractTagHandler;
import com.atom.tags.TagOptions;
import com.granule.CompressorSettings;
import com.granule.parser.Element;
import com.granule.parser.TagReader;
import com.sap.adam.storefront.tags.AcceleratorCompressTag;
import com.atom.httpwrapper.RemoveEncodingRequestWrapper;

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
		
		final HttpServletRequest httpRequest = new RemoveEncodingRequestWrapper((HttpServletRequest) pageContext.getRequest(),urlpattern);

		final BodyContent bodyContent = getBodyContent();
		final String oldBody = bodyContent.getString();
		bodyContent.clearBody();
		
		TagOptions tp = new TagOptions();
		tp.setBasePath(BASEPATH);
		tp.setGenerateName("combind.min");
		tp.setHttpRequest(httpRequest);
		tp.setID(ID);
		tp.setMethod(METHOD);
		tp.setOptions(OPTIONS);
		tp.setUrlpattern(urlpattern);
		AbstractTagHandler handler = AbstractTagHandler.buildHandlerChain(tp);
			try
			{	
				String newBody = handler.process(oldBody);
				getPreviousOut().print(newBody);
			}
			catch (final Exception e)
			{
				throw new JspTagException(e);
			}
			
		
		return SKIP_BODY;
	}
	
	
	public void setUrlpattern(String urlPattern){
		this.urlpattern = urlPattern;
	}
}
