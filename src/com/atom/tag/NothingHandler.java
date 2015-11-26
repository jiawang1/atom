/**
 * 
 */
package com.atom.tag;

import java.util.List;

import com.granule.parser.Element;
/**
 * @author i054410
 *
 */
public class NothingHandler extends AbstractTagHandler
{

	/* (non-Javadoc)
	 * @see com.atom.tag.AbstractTagHandler#process(java.lang.String, java.util.List)
	 */
	@Override
	public String process(String body, List<Element> els)
	{
		return body;
	}

}

