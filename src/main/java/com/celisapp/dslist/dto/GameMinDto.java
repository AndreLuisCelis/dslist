package com.celisapp.dslist.dto;

import java.io.Serializable;

import com.celisapp.dslist.entities.Game;

public class GameMinDto implements Serializable {

	private static final long serialVersionUID = 1L;
	private Long id;
	private String title;
	private Integer year;
	private String imgUrl;
	private String shortDescription;
	
	public GameMinDto(Game gameEntity) {
		this.id = gameEntity.getId();
		this.title = gameEntity.getTitle();
		this.year = gameEntity.getYear();
		this.imgUrl = gameEntity.getImgUrl();
		this.shortDescription = gameEntity.getShortDescription();
	}

	public Long getId() {
		return id;
	}

	public String getTitle() {
		return title;
	}

	public Integer getYear() {
		return year;
	}

	public String getImgUrl() {
		return imgUrl;
	}

	public String getShortDescription() {
		return shortDescription;
	}

}
