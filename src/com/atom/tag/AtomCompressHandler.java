/**
 * 
 */
package com.atom.tag;

import java.util.List;

import net.sf.cglib.core.CollectionUtils;

import com.granule.parser.Attribute;
import com.granule.parser.Element;
import com.granule.parser.Tags;
import com.granule.utils.PathUtils;
import com.sun.xml.internal.ws.policy.privateutil.PolicyUtils.Collections;
/**
 * @author i054410
 * 
 */
public class AtomCompressHandler extends AbstractTagHandler
{
	
	public AtomCompressHandler(){
		super();
	}
	
	public AtomCompressHandler(TagOptions tp){
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
		
		List<Element> elist = els;
		String newBody = null
	
		if(elist == null || elist.size() == 0){
			elist = getTagsFromString(body, Tags.LINK);
		}
		
		if(elist != null && elist.size() > 0){
				
			newBody = generateBody(elist, "href", ".css");
		}else{
			
			List<Element> elist = getTagsFromString(body, Tags.SCRIPT);
			if(elist != null && elist.size() > 0 ){
				newBody = generateBody(elist, "src", ".js");
			}
		}
		newBody = newBody == null?body:newBody;
		
		if(this.hasNext()){
			return this.next.process(newBody, elist);
		}
		
		return newBody;
	}

	
	private String generateBody(List<Element> els, String targetAttr, String format ){
		StringBuilder sb = new StringBuilder();
		int start = 0;
		for(int i = 0; i < els.size(); i++){
			Element ele = els.get(i);
			sb.append(body.substring(start, ele.getBegin()));
			
			if(i == els.size() - 1){
				Attribute a = ele.getAttributes().get(targetAttr);
				sb.append(body.substring(ele.getBegin(), a.getBegin()));
				sb.append(targetAttr + "=\"");
				sb.append(generateCombinedPath(a, format));
				sb.append("\" ");
				sb.append(body.substring(a.getEnd(), ele.getEnd()));
			}
			start = els.get(i).getEnd();
		}
		
		return sb.toString();
	}
	
	private String generateCombinedPath(Attribute a, String format){
		
		String value = a.getValue();
		
		return value.substring(0, value.lastIndexOf("/") +1) + format;
	}
}
