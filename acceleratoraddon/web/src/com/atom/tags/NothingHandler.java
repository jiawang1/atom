/**
 * 
 */
package com.atom.tags;

import java.util.List;

import com.granule.parser.Element;
/**
 * @author i054410
 *
 */
public class NothingHandler extends AbstractTagHandler
{
	
	public NothingHandler(){
		super();
	}
	
	public NothingHandler(TagOptions tp){
		super();
		this.tp = tp;
	}
	/* (non-Javadoc)
	 * @see com.atom.tag.AbstractTagHandler#process(java.lang.String, java.util.List)
	 */
	@Override
	public String process(String body) throws Exception
	{
		return body;
	}

}

