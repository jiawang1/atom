/**
 * 
 */
package com.atom.tags;

import java.util.List;

import javax.servlet.http.HttpServletRequest;

import com.granule.CompressTagHandler;
import com.granule.RealRequestProxy;
import com.granule.parser.Element;
import com.granule.parser.Tags;

/**
 * @author i054410
 * 
 */
public class GranuleCompressHandler extends AbstractTagHandler
{
	
	public GranuleCompressHandler(){
		super();
	}
	
	public GranuleCompressHandler(TagOptions tp){
		super();
		this.tp = tp;
	}
	/* (non-Javadoc)
	 * @see com.atom.tag.AbstractTagHandler#process(java.lang.String, java.util.List)
	 */
	@Override
	public String process(String body, List<Element> els) throws Exception
	{	
		final CompressTagHandler compressor = new CompressTagHandler(tp.getID(), tp.getMethod(), tp.getOptions(), tp.getBasePath());
		final RealRequestProxy runtimeRequest = new RealRequestProxy(tp.getHttpRequest());
		return compressor.handleTag(runtimeRequest, runtimeRequest, body);
	}


}
