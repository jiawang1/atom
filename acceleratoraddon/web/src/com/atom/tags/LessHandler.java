/**
 * 
 */
package com.atom.tags;

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
	public String process(String body) throws Exception
	{
		List<Element> tagList = getTagsFromString(body, Tags.LINK);
		String newBody = null;
		if(tagList.size() > 0){
			if(!tp.isOnlineLess()){
				newBody = body.replaceAll("stylesheet/less", "stylesheet").replaceAll(".less", ".css");
			}
		}else{
			if(tp.isOnlineLess()){
				StringBuffer sb = new StringBuffer();
				sb.append("<script> less={\"env\":\"development\",\"poll\":\"2000\"}</script>");
				sb.append("<script type=\"text/javascript\" src=\"");
				sb.append(tp.getHttpRequest().getContextPath() + "/_ui/addons/atom/share/less.min.js");
				sb.append("\"></script>");
				sb.append("<script>less.watch();</script>");
				newBody = body + sb.toString();
			}
		}
		if(hasNext()){
			return this.next.process(newBody==null?body:newBody);
		}
		return  newBody==null?body:newBody;
	}

}
