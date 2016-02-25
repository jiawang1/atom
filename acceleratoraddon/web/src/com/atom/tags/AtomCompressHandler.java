/**
 * 
 */
package com.atom.tags;

import java.util.List;

import org.jgroups.protocols.TP;

import net.sf.cglib.core.CollectionUtils;

import com.atom.constants.AtomConstants;
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
	public String process(String body) throws Exception
	{
		
		StringBuilder _newBody = new StringBuilder();
		StringBuilder _commentBody = new StringBuilder();
		
		int _cursor = 0;
		int _from = -1;
		int _to = -1;
		do{
			_from = body.indexOf("<!--[if",_cursor);
			if(_from >= 0){
				_newBody.append(body.substring(_cursor, _from));
				_to = body.indexOf("endif]-->", _from) + "endif]-->".length();
				_commentBody.append(body.substring(_from, _to));
				_cursor = _to;
			}else{
				if(_cursor > 0){
					_newBody.append(body.substring(_cursor));
				}
			}
		}while(_from >= 0);
		body = _newBody.length() > 0? _newBody.toString():body; 
		
		List<Element> elist = getTagsFromString(body, Tags.LINK);
		String newBody = null;
		
		if(elist != null && elist.size() > 0){
			String name = (String)this.tp.getHttpRequest().getSession().getAttribute(AtomConstants.COMPRESS_CSS_KEY);
			newBody = generateBody(body,elist, "href", name, this.tp.getCssDestPath(), _commentBody);
		}else{
			elist = getTagsFromString(body, Tags.SCRIPT);
			if(elist != null && elist.size() > 0 ){
				String name = (String)this.tp.getHttpRequest().getSession().getAttribute(AtomConstants.COMPRESS_JS_KEY);
				newBody = generateBody(body, elist, "src", name,this.tp.getJsDestPath(),_commentBody);
			}
		}
		newBody = newBody == null?body:newBody;
		
		if(this.hasNext()){
			return this.next.process(newBody);
		}
		
		return newBody;
	}

	
	private String generateBody(String body, List<Element> els, String targetAttr, String filename, String path, StringBuilder comments){
		StringBuilder sb = new StringBuilder();
		StringBuilder compressTagbuffer = new StringBuilder();
		int start = 0;
		for(int i = 0; i < els.size(); i++){
			Element ele = els.get(i);
			
			if(isCodedElement(ele)){
				sb.append(body.substring(start, ele.getEnd()));
			}else if (compressTagbuffer.length() == 0){
				Attribute a = ele.getAttributes().get(targetAttr);
				compressTagbuffer.append(body.substring(ele.getBegin(), a.getBegin()));
				compressTagbuffer.append(targetAttr + "=\"");
				compressTagbuffer.append(path + filename);
				compressTagbuffer.append("\" ");
				compressTagbuffer.append(body.substring(a.getEnd(), ele.getEnd()));
			}

			if(i == els.size() - 1){
				if(comments.length() > 0){
					sb.append(comments);
				}
				sb.append(compressTagbuffer);
			}
			start = ele.getEnd();
		}
		
		return sb.toString();
	}
	
	private boolean isCodedElement(Element ele ){
		return ele.getContentAsString().trim().length() > 0;
	}
	
}
