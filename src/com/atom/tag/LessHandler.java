/**
 * 
 */
package com.atom.tag;

import java.util.List;

import javax.servlet.jsp.tagext.TagSupport;

import com.granule.parser.Element;
import com.granule.parser.Tags;
/**
 * @author i054410
 * 
 */
public class LessHandler extends AbstractTagHandler
{
	public LessHandler(){
		super();
	}
	
	public LessHandler(TagOptions tp){
		super();
		this.tp = tp;
	}
	/*
	 * (non-Javadoc)
	 * 
	 * @see com.atom.tag.TagsBodyHandler#process()
	 */
	@Override
	public String process(String body, List<Element> els)
	{
		List<Element> tagList = getTagsFromString(body, Tags.LINK);
		String newBody = null;
		if(tagList.size() > 0){
			 newBody = body.replaceAll("stylesheet/less", "stylesheet").replaceAll(".less", ".css");
		}
		if(hasNext()){
			return this.next.process(newBody==null?body:newBody , tagList);
		}
		return  newBody==null?body:newBody;
	}

}
